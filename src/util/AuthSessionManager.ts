import { Session, SessionManager } from "@inrupt/solid-auth-fetcher";
import HttpError from "./HttpError";
import redisClient from "./RedisConnection";

const getKey = (key: string): string => {
  return `auth:${key}`;
};

const getAuthMapKey = (key: string): string => {
  return `authMat:${key}`;
};

export const sessionManager = new SessionManager({
  secureStorage: {
    async get(key: string): Promise<string | undefined> {
      return (await redisClient.get(getKey(key))) || undefined;
    },
    async set(key: string, value: string): Promise<void> {
      await redisClient.set(getKey(key), value);
    },
    async delete(key: string): Promise<void> {
      await redisClient.del(getKey(key));
    },
  },
});

export async function getSessionByWebId(
  webId: string
): Promise<Session | undefined> {
  const sessionId = await redisClient.get(getAuthMapKey(webId));
  if (!sessionId) {
    return undefined;
  }
  const session = await sessionManager.getSession(sessionId);
  return session;
}

export async function setSessionByWebId(session: Session): Promise<void> {
  if (!session.info.isLoggedIn || !session.info.webId) {
    throw new HttpError(
      "Cannot save to auth map. Session is not logged in.",
      401
    );
  } else {
    await redisClient.set(
      getAuthMapKey(session.info.webId),
      session.info.sessionId
    );
  }
}
