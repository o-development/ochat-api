import IChat from "./IChat";

export default async function onChatUpdate(
  newChat: Partial<IChat> & { uri: string }
): Promise<void> {
  console.log("Chat Updated");
  console.log(newChat);
}
