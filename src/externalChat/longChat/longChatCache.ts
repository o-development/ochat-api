import IFetcher from "../../util/IFetcher";

function getRedisKey(chatUrl: string): string {
  return `longChatIndex:${chatUrl}`;
}

export async function getLongChatMessageUriFromCache(
  chatUri: string,
  previousPageId?: string,
  options?: { fetcher?: IFetcher }
): Promise<string> {
  // const chats: string = await redisClient.get(getRedisKey(this.uri));

  // const uris = await this.getPageUrisAfterPageId(5, previousPageId);
  // console.log(uris);
  throw new Error("not implemented");
}
