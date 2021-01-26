import IMessage from "./IMessage";
import IFetcher from "../util/IFetcher";
import externalChatHanderFactory from "../externalChat/externalChatHandlerFactory";
import getChatIndex from "../chat/getChatIndex";

export default async function getChatMessages(
  chatUri: string,
  options: {
    fetcher?: IFetcher;
    webId: string;
    previousPageId?: string;
  }
): Promise<IMessage[]> {
  const chatIndex = await getChatIndex(chatUri, { webId: options.webId });
  const externalChatHandler = await externalChatHanderFactory(
    chatUri,
    chatIndex.type,
    { fetcher: options?.fetcher }
  );
  const messages = await externalChatHandler.getMessages(options.previousPageId);
  return messages;
}
