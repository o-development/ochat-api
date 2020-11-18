import fetchClownface from "../util/fetchClownFace";
import AbstractExternalChatHandler from "./AbstractExternalChatHandler";
import { LongChat, rdfType, ShortChat } from "../util/nodes";
import LongChatExternalChatHandler from "./longChat/LongChatExternalChatHandler";
import ShortChatExternalChatHandler from "./ShortChatExternalChatHandler";
import IFetcher from "../util/IFetcher";
import { IChatType } from "../chat/IChat";
import HttpError from "../util/HttpError";

export default async function externalChatHanderFactory(
  url: string,
  chatType?: IChatType,
  options?: { fetcher?: IFetcher }
): Promise<AbstractExternalChatHandler> {
  if (chatType != undefined) {
    switch (chatType) {
      case IChatType.LongChat:
        return new LongChatExternalChatHandler(url, chatType, {
          fetcher: options?.fetcher,
        });
      case IChatType.ShortChat:
        return new ShortChatExternalChatHandler(url, chatType, {
          fetcher: options?.fetcher,
        });
    }
  }

  const chatNode = await fetchClownface(
    url,
    [LongChat, ShortChat],
    options?.fetcher
  );
  const chatNodeTypes = chatNode.out(rdfType).values;
  for (let i = 0; i < chatNodeTypes.length; i++) {
    switch (chatNodeTypes[0]) {
      case LongChat.value:
        return LongChatExternalChatHandler.fromClownfaceNode(url, chatNode, {
          fetcher: options?.fetcher,
        });
      case ShortChat.value:
        return ShortChatExternalChatHandler.fromClownfaceNode(url, chatNode, {
          fetcher: options?.fetcher,
        });
    }
  }
  throw new HttpError(`Chat ${url} is not compatible with this app`, 400);
}
