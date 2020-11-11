import IChat from "./IChat";
import IFetcher from "../util/IFetcher";
import externalChatHandlerFactory from "../externalChat/externalChatHandlerFactory";
import { createChatIndex } from "./chatIndexApi";

export default async function newChatIndex(
  chatUrl: string,
  options: { fetcher?: IFetcher; webId: string }
): Promise<IChat> {
  const externalChatHandler = await externalChatHandlerFactory(
    chatUrl,
    undefined,
    { fetcher: options.fetcher }
  );
  const chat = await externalChatHandler.getChat();
  return createChatIndex(chat);
}
