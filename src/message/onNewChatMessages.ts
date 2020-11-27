import IMessage from "./IMessage";
import { retrieveChatIndex } from "../chat/chatIndexApi";
import redisClient from "../util/RedisConnection";

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

  console.log(messagesToPost);

  // Send socket.io

  // Determine who a push notification should be sent to

  // Construct Push notification

  // Send Push Notification
}
