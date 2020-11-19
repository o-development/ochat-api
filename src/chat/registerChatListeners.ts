import AbstractExternalChatHandler from "../externalChat/AbstractExternalChatHandler";
import externalChatHandlerFactory from "../externalChat/externalChatHandlerFactory";
import onNewChatMessage from "../message/onNewChatMessage";
import IFetcher from "../util/IFetcher";
import { IChatType } from "./IChat";
import onChatUpdate from "./onChatUpdate";

export default async function registerChatListeners(
  chatUri: string,
  options?: {
    fetcher?: IFetcher;
    optionalExternalChatHandler?: AbstractExternalChatHandler;
    chatType?: IChatType;
  }
): Promise<void> {
  let externalChatHandler: AbstractExternalChatHandler;
  if (!options?.optionalExternalChatHandler) {
    externalChatHandler = await externalChatHandlerFactory(chatUri, undefined, {
      fetcher: options?.fetcher,
    });
  } else {
    externalChatHandler = options.optionalExternalChatHandler;
  }
  await Promise.all([
    externalChatHandler.onNewMessage(onNewChatMessage),
    externalChatHandler.onChatUpdate(onChatUpdate),
  ]);
}
