import HttpError from "../util/HttpError";
import { getChatCollection } from "../util/MongoClient";
import IChat, { toIChat } from "./IChat";

export async function createChatIndex(chat: IChat): Promise<IChat> {
  const chatCollection = await getChatCollection();
  try {
    await chatCollection.insertOne({
      ...chat,
    });
    return chat;
  } catch (err) {
    if (err.code === 11000) {
      throw new HttpError(`${chat.uri} is already indexed.`, 409, {
        uri: chat.uri,
      });
    }
    throw err;
  }
}

export async function retrieveChatIndex(chatUri: string): Promise<IChat> {
  const chatCollection = await getChatCollection();
  const chat = await chatCollection.findOne({ uri: chatUri });
  if (chat) {
    return toIChat(chat);
  } else {
    throw new HttpError(`Chat ${chatUri} not found.`, 404, { uri: chatUri });
  }
}

export function updateChatIndex(chat: Partial<IChat>): Promise<IChat> {
  throw new Error("Not Implemented");
}

export function deleteChatIndex(chatUri: string): Promise<IChat> {
  throw new Error("Not Implemented");
}
