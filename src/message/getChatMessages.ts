import IMessage from "./IMessage";
import IFetcher from "../util/IFetcher";
import externalChatHanderFactory from "../externalChat/externalChatHandlerFactory";

export default async function getChatMessages(
  chatUri: string,
  prveiousPageId?: string,
  options?: { fetcher?: IFetcher }
): Promise<IMessage[]> {
  const externalChatHandler = await externalChatHanderFactory(
    chatUri,
    undefined,
    { fetcher: options?.fetcher }
  );
  const messages = await externalChatHandler.getMessages(prveiousPageId);
  return messages;
}
