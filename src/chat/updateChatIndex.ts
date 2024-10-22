import IChat from "./IChat";
import { getChatCollection } from "../util/MongoClient";
import onChatUpdate from "./onChatUpdate";
import { retrieveChatIndex } from "./chatIndexApi";
import HttpError from "../util/HttpError";
import IFetcher from "../util/IFetcher";
import externalChatHanderFactory from "../externalChat/externalChatHandlerFactory";

export default async function updateChatIndex(
  chatUri: string,
  chatData: Partial<IChat>,
  options: {
    webId: string;
    fetcher?: IFetcher;
    preventAclUpdate?: boolean;
  }
): Promise<void> {
  const chatCollection = await getChatCollection();
  const currentChat = await retrieveChatIndex(chatUri);
  // Check if webid is admin
  const userIsAdmin =
    currentChat.participants.findIndex(
      (p) => p.webId === options.webId && p.isAdmin
    ) !== -1;

  const externalChatHandler = await externalChatHanderFactory(
    chatUri,
    currentChat.type,
    { fetcher: options.fetcher }
  );
  if (chatData.isPublic || chatData.participants) {
    // Handle updating of participants
    if (!userIsAdmin) {
      throw new HttpError(
        "Only administrators can modify chat access settings",
        403
      );
    }
    if (!options.preventAclUpdate) {
      await externalChatHandler.updateExternalChatParticipants(
        chatData.participants || currentChat.participants,
        chatData.isPublic || currentChat.isPublic
      );
    }
  }
  if (chatData.name || chatData.images) {
    // Handle updating of images and name
    if (!userIsAdmin) {
      throw new HttpError(
        "Only administrators can modify chat access settings",
        403
      );
    }
    await externalChatHandler.updateExternalChat(chatData);
  }
  try {
    await chatCollection.updateOne(
      {
        uri: chatUri,
      },
      {
        $set: {
          ...chatData,
        },
      }
    );
    onChatUpdate(chatUri);
    return;
  } catch (err) {
    throw err;
  }
}
