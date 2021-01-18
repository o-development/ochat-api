import redisClient from "../util/RedisConnection";
import { INotificationWebSubscription, toINotificationWebSubscription } from "./INotificationWebSubscriptionRequest";

export function getMobileNotificationSubscriptionStorageKey(key: string): string {
  return `mobileNotificationSubscription:${key}`;
}

export async function registerMobileNotificationSubscription(
  token: string,
  options: { webId: string }
): Promise<void> {
  const curSubscriptions = await getMobileNotificationSubscriptionsById(options.webId);
  curSubscriptions.push(token);
  await redisClient.set(
    getMobileNotificationSubscriptionStorageKey(options.webId),
    JSON.stringify(curSubscriptions),
  );
}

export async function getMobileNotificationSubscriptionsById(webId: string) {
  let curSubscriptions: string[] = [];
  try {
    const curSubscriptionsRaw = await redisClient.get(
      getMobileNotificationSubscriptionStorageKey(webId),
    );
    if (curSubscriptionsRaw) {
      const curSubscriptionsParsed = JSON.parse(curSubscriptionsRaw);
      if (
        Array.isArray(curSubscriptionsParsed) &&
        curSubscriptionsParsed.every(token => typeof token === 'string')
      ) {
        curSubscriptions = curSubscriptionsParsed;
      }
    }
  } catch {}
  return curSubscriptions;
}