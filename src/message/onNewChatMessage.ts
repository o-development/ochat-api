import IMessage from "./IMessage";

export default async function onNewChatMessage(
  message: IMessage
): Promise<void> {
  console.log("Got Message");
  console.log(message);
}
