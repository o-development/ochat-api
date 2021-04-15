import { namedNode } from "@rdfjs/dataset";
import IMessage, { toIMessage } from "../../message/IMessage";
import { fetchClownfaceDataset } from "../../util/clownFaceUtils";
import IFetcher from "../../util/IFetcher";
import {
  content,
  dateCreatedTerms,
  flowMessage,
  liqidChatFile,
  liqidChatImage,
  liqidChatSignedCredential,
  maker,
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
      const potentialMessage = {
        id: nodeHash.substring(1),
        page: chatMessageDocumentUrl,
        maker: messageNode.out(maker).value,
        content: {
          text: messageNode.out(content).value,
          image: messageNode.out(liqidChatImage).value,
          file: messageNode.out(liqidChatFile).value,
        },
        timeCreated: messageNode.out(dateCreatedTerms).value,
      };
      const jwt = messageNode.out(liqidChatSignedCredential).value;
      const message = toIMessage(potentialMessage);
      message.isInvalid = !(await isMessageVerified(message, jwt));
      return message;
    }
  ));
}
