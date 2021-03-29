import { AnyPointer } from "clownface";
import IChat, { IChatType } from "../../chat/IChat";
import { fetchClownfaceNode } from "../../util/clownFaceUtils";
import IFetcher from "../../util/IFetcher";
import { dateCreatedTerms, foafImage, isDiscoverable, isPublic, participant, SplitChat, splitChatMessageGroup, title } from "../../util/nodes";
import { ISplitChatMessageGroup } from "./ISplitChatMessageGroup";
import { getParticipantsFromClownfaceNode } from './splitChatParticipantUtils';

interface IFetchSplitChatReturnValue {
  chat: IChat,
  messageGroups: ISplitChatMessageGroup[]
}

export default async function fetchSplitChat(
  uri: string,
  options: { fetcher?: IFetcher }
): Promise<IFetchSplitChatReturnValue> {
  const chatNode = await fetchClownfaceNode(uri, [SplitChat], options.fetcher);
  const { chat, messageGroups } = await processClownfaceChatNode(chatNode, options);
  if (messageGroups[messageGroups.length - 1]) {
    messageGroups[messageGroups.length - 1] = 
  }
}

export async function processClownfaceChatNode(
  node: AnyPointer,
  options: { fetcher?: IFetcher }
): Promise<IFetchSplitChatReturnValue> {
  // Metadata
  const chat: IChat = {
    uri: node.value,
    type: IChatType.SplitChat,
    name: node.out(title).value || "",
    images: node.out(foafImage).values,
    isDiscoverable: node.out(isDiscoverable).value === "true",
    isPublic: node.out(isPublic).value === "true",
    participants: await getParticipantsFromClownfaceNode(node, options),
  };

  // MessageGroups
  const messageGroups: ISplitChatMessageGroup[] = [];
  const messageGroupNodes = node.out(splitChatMessageGroup).toArray();
  messageGroupNodes.forEach((messageGroupNode) => {
    messageGroups.push({
      fetched: false,
      date: messageGroupNode.out(dateCreatedTerms).value,
      userMessageGroups: messageGroupNode.out(splitChatMessageGroup).map((userMessageGroupNode) => {
        return {
          webId: userMessageGroupNode.out(participant).value,
          uri: userMessageGroupNode.out(splitChatMessageGroup).value,
        };
      }),
      messages: [],
    });
  });

  return {
    chat,
    messageGroups: messageGroups.sort((a, b) => {
      if (a === b) {
        return 0;
      } else if (a > b) {
        return 1;
      } else {
        return -1;
      }
    });
  };
}
