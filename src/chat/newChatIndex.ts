import IChat from "./IChat";
import IFetcher from "../util/IFetcher";
import externalChatHandlerFactory from "../externalChat/externalChatHandlerFactory";
import { createChatIndex } from "./chatIndexApi";
import registerChatListeners from "./registerChatListeners";
import AbstractExternalChatHandler from "../externalChat/AbstractExternalChatHandler";
import onChatUpdate from "./onChatUpdate";

export default async function newChatIndex(
  chatUri: string,
  options: {
    fetcher?: IFetcher;
    webId: string;
    optionalExternalChatHandler?: AbstractExternalChatHandler;
  }
): Promise<IChat> {
  const externalChatHandler =
    options.optionalExternalChatHandler ||
    (await externalChatHandlerFactory(chatUri, undefined, {
      fetcher: options.fetcher,
    }));
  const chat = await externalChatHandler.getChat();
  const indexedChat = await createChatIndex(chat);
  await externalChatHandler.runStartupTask();
  await registerChatListeners(chatUri, {
    optionalExternalChatHandler: externalChatHandler,
    fetcher: options.fetcher,
  });
  await onChatUpdate(indexedChat);
  return indexedChat;
}
