import IMessage from "./IMessage";
import { retrieveChatIndex } from "../chat/chatIndexApi";
import redisClient from "../util/RedisConnection";
import { sendToSocketByWebId } from "../socketHanders/socketHandler";
import updateChatIndex from "../chat/updateChatIndex";

export function getRedisChatMessageKey(
  chatUri: string,
  messageId: string
): string {
  return `chatMessageKey:${chatUri}:${messageId}`;
}

export default async function onNewChatMessages(
  chatUri: string,
  messages: IMessage[]
): Promise<void> {
  const messagesToPost: IMessage[] = [];
  const [chat] = await Promise.all([
    // Get Chat from Es
    retrieveChatIndex(chatUri),
    // Find the messages that have not yet been posted
    Promise.all(
      messages.map(async (message) => {
        const alreadySent = await redisClient.get(
          getRedisChatMessageKey(chatUri, message.id)
        );
        if (!alreadySent) {
          messagesToPost.push(message);
          await redisClient.set(
            getRedisChatMessageKey(chatUri, message.id),
            "true"
          );
        }
      })
    ),
  ]);

  // Get all participants
  const chatParticipantWebIds = chat.participants.map(
    (participant) => participant.webId
  );

  // Send socket.io
  chatParticipantWebIds.forEach((webId) => {
    sendToSocketByWebId(webId, "message", chatUri, messagesToPost);
  });

  // Determine who a push notification should be sent to

  // Construct Push notification

  // Send Push Notification

  // Update Chat with new message
  const mostRecentMessage = messages.sort((a, b) => {
    if (a.timeCreated > b.timeCreated) {
      return -1;
    } else if (a.timeCreated < b.timeCreated) {
      return 1;
    } else {
      return 0;
    }
  })[0];
  if (mostRecentMessage) {
    await updateChatIndex(
      chatUri,
      {
        lastMessage: mostRecentMessage,
      },
      { webId: mostRecentMessage.maker }
    );
  }
}
