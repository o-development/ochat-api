import externalChatHanderFactory from "../externalChat/externalChatHandlerFactory";
import HttpError from "../util/HttpError";
import IFetcher from "../util/IFetcher";
import IMessage, { IMessageCreationData } from "./IMessage";
import onNewChatMessages from "./onNewChatMessages";
import { v4 } from "uuid";
import getChatIndex from "../chat/getChatIndex";
import updateChatIndex from "../chat/updateChatIndex";
import { retrieveProfileIndex } from "../profile/profileIndexApi";
import getAdministratorAuthSessionForChat from '../util/getAdministratorAuthSessionForChat';

export default async function createNewChatMessage(
  chatUri: string,
  messageCreationData: IMessageCreationData,
  options: { fetcher?: IFetcher; webId: string }
): Promise<IMessage> {
  if (messageCreationData.maker !== options.webId) {
    throw new HttpError("Cannot create a message with a different user.", 400);
  }
  // Check if the user is allowed to create the message
  const chat = await getChatIndex(chatUri, { webId: options.webId });
  if (!chat.participants.some(p => p.webId === options.webId)) {
    throw new HttpError('You are not a participant of this chat', 403);
  }

  // Construct message
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
