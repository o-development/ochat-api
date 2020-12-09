import externalChatHanderFactory from "../externalChat/externalChatHandlerFactory";
import HttpError from "../util/HttpError";
import IFetcher from "../util/IFetcher";
import IMessage, { IMessageCreationData } from "./IMessage";
import onNewChatMessages from "./onNewChatMessages";
import { v4 } from "uuid";

export default async function createNewChatMessage(
  chatUri: string,
  messageCreationData: IMessageCreationData,
  options: { fetcher?: IFetcher; webId: string }
): Promise<IMessage> {
  if (messageCreationData.maker !== options.webId) {
    throw new HttpError("Cannot create a message with a different user.", 400);
  }
  const message: IMessage = {
    ...messageCreationData,
    id: messageCreationData.id || v4(),
    timeCreated: new Date().toISOString(),
    page: "",
  };
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
      await onNewChatMessages(chatUri, [message]);
    })(),
  ]);
  return savedMessage;
}
