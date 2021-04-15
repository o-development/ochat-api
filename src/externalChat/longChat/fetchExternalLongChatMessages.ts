import { namedNode } from "@rdfjs/dataset";
import IMessage, { toIMessage } from "../../message/IMessage";
import { fetchClownfaceDataset } from "../../util/clownFaceUtils";
import IFetcher from "../../util/IFetcher";
import {
  content,
  contentUrl,
  dateCreatedTerms,
  flowMessage,
  ImageObject,
  liqidChatSignedCredential,
  maker,
  MediaObject,
  rdfType,
  VideoObject,
} from "../../util/nodes";
import { isMessageVerified } from "../util/messageVerificationUtils";

export default async function fetchExternalLongChatMessages(
  chatUri: string,
  chatMessageDocumentUrl: string,
  options?: { fetcher?: IFetcher }
): Promise<IMessage[]> {
  const messageDataset = await fetchClownfaceDataset(
    chatMessageDocumentUrl,
    options?.fetcher
  );
  const messageContainerNode = messageDataset.node(namedNode(chatUri));
  const messageNodes = messageContainerNode.out(flowMessage);
  return Promise.all(messageNodes.map(
    async (messageNode): Promise<IMessage> => {
      const nodeHash = new URL(messageNode.value).hash;
      const potentialMessage: Partial<IMessage> = {
        id: nodeHash.substring(1),
        page: chatMessageDocumentUrl,
        maker: messageNode.out(maker).value,
        content: {},
        timeCreated: messageNode.out(dateCreatedTerms).value,
      };
      messageNode.out(content).forEach((contentNode) => {
        const nodeTypes = contentNode.out(rdfType).values;
        let key: "image" | "text" | "video" | "file";
        let value: string | undefined;
        if (nodeTypes.includes(ImageObject.value)) {
          // Node is an image
          key = "image";
          value = contentNode.out(contentUrl).value;
        } else if (nodeTypes.includes(VideoObject.value)) {
          // Node is a video
          key = "video";
          value = contentNode.out(contentUrl).value;
        } else if (nodeTypes.includes(MediaObject.value)) {
          // Node is a file
          key = "file"
          value = contentNode.out(contentUrl).value;
        } else {
          // Node is text
          key = "text";
          value = contentNode.value; 
        }
        if (value) {
          if (potentialMessage.content && potentialMessage.content[key]) {
            potentialMessage.content[key]?.push(value);
          } else if (potentialMessage.content) {
            potentialMessage.content[key] = [value];
          }
        }
      });
      const jwt = messageNode.out(liqidChatSignedCredential).value;
      const message = toIMessage(potentialMessage);
      message.isInvalid = !(await isMessageVerified(message, jwt));
      return message;
    }
  ));
}
