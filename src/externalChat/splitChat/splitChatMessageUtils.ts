import IMessage from "../../message/IMessage";
import { fetchClownfaceNode } from "../../util/clownFaceUtils";
import IFetcher from "../../util/IFetcher";
import { MessageGroup } from "../../util/nodes";
import { ISplitChatMessageGroup } from "./ISplitChatMessageGroup";

export async function fetchMessageGroup(messageGroup: ISplitChatMessageGroup, options: { fetcher: IFetcher }) {
  const messageGroups = 

  const messages: IMessage[] = await Promise.all(messageGroup.userMessageGroups.map(async (userMessageGroup) => {
    try {
      const messageGroupNode = await fetchClownfaceNode(userMessageGroup.uri, [MessageGroup], options.fetcher);
      
      const 
    } catch {
      // Do nothing, just ignore this if it doesn't work
    }
  }))
  
}
