import externalChatHanderFactory from "../externalChat/externalChatHandlerFactory";
import HttpError from "../util/HttpError";
import IFetcher from "../util/IFetcher";
import IMessage from "./IMessage";
import onNewChatMessage from "./onNewChatMessage";

export default async function createNewChatMessage(
  chatUri: string,
  message: IMessage,
  options: { fetcher?: IFetcher; webId: string }
): Promise<IMessage> {
  if (message.maker !== options.webId) {
    throw new HttpError("Cannot create a message with a different user.", 400);
  }
  const [savedMessage] = await Promise.all([
    (async () => {
      const externalChatHandler = await externalChatHanderFactory(
        chatUri,
        undefined,
        { fetcher: options.fetcher }
      );
      return await externalChatHandler.addMessage(message);
    })(),
    (async () => {
      await onNewChatMessage(chatUri, message);
    })(),
  ]);
  return savedMessage;
}
