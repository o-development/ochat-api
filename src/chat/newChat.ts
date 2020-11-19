import IChat from "./IChat";
import IFetcher from "../util/IFetcher";

export default function newChat(
  chatData: IChat,
  options: { fetcher?: IFetcher; webId: string }
): Promise<IChat> {
  // TODO
  throw new Error("not implemented");
  // const indexedChat = await createChatIndex(chat);
  // await registerChatListeners(chatUri, {
  //   optionalExternalChatHandler: externalChatHandler,
  //   fetcher: options.fetcher,
  // });
  // return indexedChat;
}
