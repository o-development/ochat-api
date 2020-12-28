import { sendToSocketByWebId } from "../socketHanders/socketHandler";
import { retrieveChatIndex } from "./chatIndexApi";

export default async function onChatUpdate(chatUri: string): Promise<void> {
  const chat = await retrieveChatIndex(chatUri);

  // Get all participants
  const chatParticipantWebIds = chat.participants.map(
    (participant) => participant.webId
  );

  // Send socket.io
  chatParticipantWebIds.forEach((webId) => {
    sendToSocketByWebId(webId, "chat", chatUri, chat);
  });
}
