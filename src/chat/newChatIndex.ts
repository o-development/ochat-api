import IChat from "./IChat";
import IFetcher from "../util/IFetcher";
import externalChatHandlerFactory from "../externalChat/externalChatHandlerFactory";
import { createChatIndex } from "./chatIndexApi";
import registerChatListeners from "./registerChatListeners";

export default async function newChatIndex(
  chatUri: string,
  options: { fetcher?: IFetcher; webId: string }
): Promise<IChat> {
  const externalChatHandler = await externalChatHandlerFactory(
    chatUri,
    undefined,
    { fetcher: options.fetcher }
  );
  const chat = await externalChatHandler.getChat();
  const indexedChat = await createChatIndex(chat);
  await registerChatListeners(chatUri, {
    optionalExternalChatHandler: externalChatHandler,
    fetcher: options.fetcher,
  });
  return indexedChat;
}
