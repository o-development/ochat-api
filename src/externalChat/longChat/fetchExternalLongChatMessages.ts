import { namedNode } from "@rdfjs/dataset";
import IMessage, { toIMessage } from "../../message/IMessage";
import { fetchClownfaceDataset } from "../../util/clownFaceUtils";
import IFetcher from "../../util/IFetcher";
import {
  content,
  dateCreatedTerms,
  flowMessage,
  maker,
} from "../../util/nodes";

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
  return messageNodes.map(
    (messageNode): IMessage => {
      const nodeHash = new URL(messageNode.value).hash;
      const potentialMessage = {
        id: nodeHash.substring(1),
        page: chatMessageDocumentUrl,
        maker: messageNode.out(maker).value,
        content: messageNode.out(content).value,
        timeCreated: messageNode.out(dateCreatedTerms).value,
      };
      return toIMessage(potentialMessage);
    }
  );
}
