import IMessage from "./IMessage";

export default async function onNewChatMessage(
  chatUri: string,
  message: IMessage
): Promise<void> {
  console.log(`Got Message for ${chatUri}`);
  console.log(message);
}
