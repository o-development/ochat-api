import redisClient from "../../util/RedisConnection";
import IFetcher from "../../util/IFetcher";
import validateSchema from "../../util/validateSchema";
import getLongChatMessageUris from "./getLongChatMessageUris";
import HttpError from "../../util/HttpError";

export function getLongChatKey(chatUrl: string): string {
  return `longChatIndex:${chatUrl}`;
}

export async function getLongChatMessageUriFromCache(
  chatUri: string,
  previousPageId?: string,
  options?: { fetcher?: IFetcher }
): Promise<string> {
  const chatUriString: string | null = await redisClient.get(
    getLongChatKey(chatUri)
  );
  let storedChatUris: string[] = [];
  // Check to see if the value saved in Redis is valid
  if (chatUriString) {
    try {
      const potentialChatString = JSON.parse(chatUriString);
      validateSchema(potentialChatString, {
        type: "array",
        items: { type: "string", format: "uri" },
      });
      storedChatUris = potentialChatString;
    } catch (err) {
      // do nothing
    }
  }

  let foundUri: string | undefined = undefined;
  let err: Error | undefined = undefined;
  while (!foundUri && !err) {
    // Check to see if our deired chat is in the list
    if (!previousPageId && storedChatUris[0]) {
      foundUri = storedChatUris[0];
    } else if (
      previousPageId &&
      storedChatUris.indexOf(previousPageId) &&
      storedChatUris[storedChatUris.indexOf(previousPageId) + 1]
    ) {
      foundUri = storedChatUris[storedChatUris.indexOf(previousPageId) + 1];
    }
    if (!foundUri) {
      // Fetch the next pages
      const MIN_PAGES_TO_FETCH = 5;
      const newUris = await getLongChatMessageUris(
        chatUri,
        MIN_PAGES_TO_FETCH,
        storedChatUris[storedChatUris.length - 1],
        { fetcher: options?.fetcher }
      );
      storedChatUris = [...new Set(storedChatUris.concat(newUris))]
        .sort()
        .reverse();
      if (newUris.length < MIN_PAGES_TO_FETCH) {
        err = new HttpError("No more chats exist", 404, {
          previousPageId: previousPageId,
        });
      }
    }
  }
  await redisClient.set(
    getLongChatKey(chatUri),
    JSON.stringify(storedChatUris)
  );
  if (err || !foundUri) {
    throw err || new Error("Uri not found");
  }
  return foundUri;
}
