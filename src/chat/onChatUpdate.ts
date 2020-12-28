import { sendToSocketByWebId } from "../socketHanders/socketHandler";
import { retrieveChatIndex } from "./chatIndexApi";
import IChat from "./IChat";

export default async function onChatUpdate(
  chatUri: string,
  updatedChat?: Partial<IChat>
): Promise<void> {
  const indexedChat = await retrieveChatIndex(chatUri);

  const chat: IChat = {
    ...indexedChat,
    ...updatedChat,
  };

  // Get all participants
  const chatParticipantWebIds = chat.participants.map(
    (participant) => participant.webId
  );

  // Send socket.io
  chatParticipantWebIds.forEach((webId) => {
    sendToSocketByWebId(webId, "chat", chatUri, chat);
  });
}
