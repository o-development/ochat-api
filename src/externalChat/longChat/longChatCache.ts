import redisClient from "../../util/RedisConnection";
import IFetcher from "../../util/IFetcher";
import validateSchema from "../../util/validateSchema";
import catchUpLongChatMessageUris from "./catchUpLongChatMessageUris";
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
  let storedChatUris: string[] | undefined = undefined;
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

  if (!storedChatUris) {
    // Update the Cache
    storedChatUris = await catchUpLongChatMessageUris(chatUri, undefined, {
      fetcher: options?.fetcher,
    });
    await redisClient.set(
      getLongChatKey(chatUri),
      JSON.stringify(storedChatUris)
    );
  }

  // Get the right chat URI
  if (storedChatUris) {
    if (!previousPageId && storedChatUris[0]) {
      return storedChatUris[0];
    } else if (
      previousPageId &&
      storedChatUris.indexOf(previousPageId) !== -1 &&
      storedChatUris[storedChatUris.indexOf(previousPageId) + 1]
    ) {
      return storedChatUris[storedChatUris.indexOf(previousPageId) + 1];
    }
  }
  throw new HttpError(
    `Could not find the chat after page ${previousPageId}`,
    404,
    { chatUri, previousPageId }
  );
}
