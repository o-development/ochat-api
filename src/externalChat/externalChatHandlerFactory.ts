import fetchClownface from "../util/fetchClownFace";
import AbstractExternalChatHandler from "./AbstractExternalChatHandler";
import { LongChat, rdfType, ShortChat } from "../util/nodes";
import LongChatExternalChatHandler from "./longChat/LongChatExternalChatHandler";
import ShortChatExternalChatHandler from "./ShortChatExternalChatHandler";
import IFetcher from "../util/IFetcher";
import { IChatType } from "../chat/IChat";
import HttpError from "../util/HttpError";
import redisClient from "../util/RedisConnection";

export function getChatTypeKey(chatId: string): string {
  return `chatType:${chatId}`;
}

export default async function externalChatHanderFactory(
  uri: string,
  chatType?: IChatType,
  options?: { fetcher?: IFetcher }
): Promise<AbstractExternalChatHandler> {
  const cachedChatType: string | undefined =
    chatType || (await redisClient.get(getChatTypeKey(uri))) || undefined;
  if (cachedChatType != undefined) {
    switch (chatType) {
      case IChatType.LongChat:
        return new LongChatExternalChatHandler(uri, chatType, {
          fetcher: options?.fetcher,
        });
      case IChatType.ShortChat:
        return new ShortChatExternalChatHandler(uri, chatType, {
          fetcher: options?.fetcher,
        });
    }
  }

  const chatNode = await fetchClownface(
    uri,
    [LongChat, ShortChat],
    options?.fetcher
  );
  const chatNodeTypes = chatNode.out(rdfType).values;
  for (let i = 0; i < chatNodeTypes.length; i++) {
    switch (chatNodeTypes[0]) {
      case LongChat.value:
        return LongChatExternalChatHandler.fromClownfaceNode(uri, chatNode, {
          fetcher: options?.fetcher,
        });
      case ShortChat.value:
        return ShortChatExternalChatHandler.fromClownfaceNode(uri, chatNode, {
          fetcher: options?.fetcher,
        });
    }
  }
  throw new HttpError(`Chat ${uri} is not compatible with this app`, 400);
}
