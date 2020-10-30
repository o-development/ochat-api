import { Session, SessionManager } from "@inrupt/solid-auth-fetcher";
import { redisClient } from "./RedisConnection";

const getKey = (key: string): string => {
  return `auth:${key}`;
};

const getAuthMapKey = (key: string): string => {
  return `authMat:${key}`;
};

export const sessionManager = new SessionManager({
  secureStorage: {
    async get(key: string): Promise<string> {
      return new Promise((resolve, reject) => {
        redisClient.get(getKey(key), (err, value) => {
          if (err) {
            reject(err);
          } else {
            resolve(value || undefined);
          }
        });
      });
    },
    async set(key: string, value: string): Promise<void> {
      return new Promise((resolve, reject) => {
        redisClient.set(getKey(key), value, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    },
    async delete(key: string): Promise<void> {
      return new Promise((resolve, reject) => {
        redisClient.del(getKey(key), (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    },
  },
});

export async function getSessionByWebId(
  webId: string
): Promise<Session | undefined> {
  return new Promise((resolve, reject) => {
    redisClient.get(getAuthMapKey(webId), async (err, sessionId) => {
      if (err) {
        reject(err);
      } else if (!sessionId) {
        resolve(undefined);
      } else {
        const session = await sessionManager.getSession(sessionId);
        resolve(session);
      }
    });
  });
}

export async function setSessionByWebId(session: Session): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!session.info.isLoggedIn || !session.info.webId) {
      reject("Cannot save to auth map. Session is not logged in.");
    } else {
      redisClient.set(
        getAuthMapKey(session.info.webId),
        session.info.sessionId,
        async (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    }
  });
}
