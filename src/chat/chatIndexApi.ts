import HttpError from "../util/HttpError";
import EsClient from "../util/EsClient";
import IChat from "./IChat";

export async function createChatIndex(chat: IChat): Promise<IChat> {
  try {
    await EsClient.create({
      id: chat.uri,
      index: "chat",
      body: chat,
    });
    return chat;
  } catch (err) {
    if (err.meta?.statusCode === 409) {
      throw new HttpError(`${chat.uri} already indexed`, 409, {
        uri: chat.uri,
      });
    }
    throw err;
  }
}

export function retrieveChatIndex(chatUri: string): Promise<IChat> {
  throw new Error("Not Implemented");
}

export function updateChatIndex(chat: Partial<IChat>): Promise<IChat> {
  throw new Error("Not Implemented");
}

export function deleteChatIndex(chatUri: string): Promise<IChat> {
  throw new Error("Not Implemented");
}
