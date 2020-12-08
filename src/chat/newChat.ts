import IChat from "./IChat";
import IFetcher from "../util/IFetcher";
import externalChatHanderFactory from "../externalChat/externalChatHandlerFactory";
import { createChatIndex } from "./chatIndexApi";
import newChatIndex from "./newChatIndex";
import registerChatListeners from "./registerChatListeners";

export default async function newChat(
  chatData: IChat,
  options: { fetcher?: IFetcher; webId: string }
): Promise<IChat> {
  // Get the Chat Handler
  const externalChatHandler = await externalChatHanderFactory(
    chatData.uri,
    chatData.type,
    { fetcher: options.fetcher }
  );

  // Create the chat
  await externalChatHandler.createExternalChat(chatData);

  // Index Chat
  const indexedChat = await newChatIndex(chatData.uri, {
    fetcher: options.fetcher,
    webId: options.webId,
    optionalExternalChatHandler: externalChatHandler,
  });
  return indexedChat;
}
