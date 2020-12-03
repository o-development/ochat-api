import IChat from "./IChat";
import IFetcher from "../util/IFetcher";
import externalChatHanderFactory from "../externalChat/externalChatHandlerFactory";

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

  throw new Error("Not Implemented");

  // const indexedChat = await createChatIndex(chat);
  // await registerChatListeners(chatUri, {
  //   optionalExternalChatHandler: externalChatHandler,
  //   fetcher: options.fetcher,
  // });
  // return indexedChat;
}
