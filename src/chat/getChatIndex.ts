import { Collection } from "mongodb";
import HttpError from "../util/HttpError";
import { getChatCollection } from "../util/MongoClient";
import IChat, { toIChat } from "./IChat";

export default async function getChatIndex(
  chatUri: string,
  options: { webId: string }
): Promise<IChat> {
  const chatCollection = await getChatCollection();
  const chat = await chatCollection.findOne({
    uri: chatUri,
    "participants.webId": options.webId,
  });
  if (chat) {
    return toIChat(chat);
  } else {
    throw new HttpError(`Chat ${chatUri} not found.`, 404, { uri: chatUri });
  }
}
