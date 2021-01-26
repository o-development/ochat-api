import IMessage from "./IMessage";
import { retrieveChatIndex } from "../chat/chatIndexApi";
import redisClient from "../util/RedisConnection";
import { sendToSocketByPublicChatUri, sendToSocketByWebId } from "../socketHanders/socketHandler";
import updateChatIndex from "../chat/updateChatIndex";
import sendNotifications from "../notification/sendNotifications";

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

  if (chat.isPublic) {
    sendToSocketByPublicChatUri(chatUri, "message", chatUri, messagesToPost);
  }

  // Send Notification
  await Promise.all(
    messagesToPost.map(async (message) => {
      await Promise.all(
        chat.participants
          .filter((participant) => participant.webId !== message.maker)
          .map(async (participant) => {
            await sendNotifications(participant.webId, {
              title: participant.name || participant.webId,
              text: message.content,
              chatUri: chat.uri,
            });
          })
      );
    })
  );

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
