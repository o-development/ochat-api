import { SessionManager } from "@inrupt/solid-auth-fetcher";
import { redisClient } from "./RedisConnection";

const getKey = (key: string): string => {
  return `auth:${key}`;
};

export const sessionManager = new SessionManager({
  secureStorage: {
    async get(key: string): Promise<string> {
      return new Promise((resolve, reject) => {
        redisClient.get(getKey(key), (err, value) => {
          if (err) {
            reject(err);
          }
          resolve(value || undefined);
        });
      });
    },
    async set(key: string, value: string): Promise<void> {
      return new Promise((resolve, reject) => {
        redisClient.set(getKey(key), value, (err) => {
          if (err) {
            reject(err);
          }
          resolve();
        });
      });
    },
    async delete(key: string): Promise<void> {
      return new Promise((resolve, reject) => {
        redisClient.del(getKey(key), (err) => {
          if (err) {
            reject(err);
          }
          resolve();
        });
      });
    },
  },
});
