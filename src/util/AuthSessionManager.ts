import { Session, SessionManager } from "@inrupt/solid-auth-fetcher";
import HttpError from "./HttpError";
import redisClient from "./RedisConnection";

export const getAuthKey = (key: string): string => {
  return `auth:${key}`;
};

export const getAuthMapKey = (key: string): string => {
  return `authMat:${key}`;
};

export const sessionManager = new SessionManager({
  secureStorage: {
    async get(key: string): Promise<string | undefined> {
      return (await redisClient.get(getAuthKey(key))) || undefined;
    },
    async set(key: string, value: string): Promise<void> {
      await redisClient.set(getAuthKey(key), value);
    },
    async delete(key: string): Promise<void> {
      await redisClient.del(getAuthKey(key));
    },
  },
});

/**
 * Session Map
 */

async function getSessionSet(webId: string): Promise<Set<string>> {
  const curSessions = await redisClient.get(getAuthMapKey(webId));
  return curSessions ? new Set(JSON.parse(curSessions)) : new Set();
}

export async function getSessionByWebId(
  webId: string
): Promise<Session | undefined> {
  const sessionSet = await getSessionSet(webId);
  const sessionId = sessionSet.values().next().value;
  if (!sessionId) {
    return undefined;
  }
  const session = await sessionManager.getSession(sessionId);
  return session;
}

export async function setSessionByWebId(
  session: Session,
  shouldRemove?: boolean
): Promise<void> {
  if (!session.info.isLoggedIn || !session.info.webId) {
    throw new HttpError(
      "Cannot save to auth map. Session is not logged in.",
      401
    );
  } else {
    const sessionSet = await getSessionSet(session.info.webId);
    if (!shouldRemove) {
      sessionSet.add(session.info.sessionId);
    } else {
      sessionSet.delete(session.info.sessionId);
    }
    await redisClient.set(
      getAuthMapKey(session.info.webId),
      JSON.stringify(Array.from(sessionSet))
    );
  }
}

export async function removeAllSessionsByWebId(webId: string): Promise<void> {
  await redisClient.del(getAuthMapKey(webId));
}
