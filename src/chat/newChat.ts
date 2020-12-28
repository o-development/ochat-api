import IChat from "./IChat";
import IFetcher from "../util/IFetcher";
import externalChatHanderFactory from "../externalChat/externalChatHandlerFactory";
import newChatIndex from "./newChatIndex";
import createNewChatMessage from "../message/createChatMessage";

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

  // Create a message that this person made a new chat
  const creatorsName =
    indexedChat.participants.find((p) => p.webId === options.webId)?.name ||
    options.webId;
  await createNewChatMessage(
    chatData.uri,
    {
      maker: options.webId,
      content: `${creatorsName} created "${chatData.name}"`,
    },
    { fetcher: options.fetcher, webId: options.webId }
  );
  return indexedChat;
}
