import redisClient from "../util/RedisConnection";
import { INotificationWebSubscription, toINotificationWebSubscription } from "./INotificationWebSubscriptionRequest";

export function getWebNotificationSubscriptionStorageKey(key: string): string {
  return `webNotificationSubscription:${key}`;
}

export async function registerWebNotificationSubscription(
  subscriptionInfo: INotificationWebSubscription,
  options: { webId: string }
): Promise<void> {
  const curSubscriptions = await getWebNotificationSubscriptionsById(options.webId);
  curSubscriptions.push(subscriptionInfo);
  await redisClient.set(
    getWebNotificationSubscriptionStorageKey(options.webId),
    JSON.stringify(curSubscriptions),
  );
}

export async function getWebNotificationSubscriptionsById(webId: string) {
  let curSubscriptions: INotificationWebSubscription[] = [];
  try {
    const curSubscriptionsRaw = await redisClient.get(
      getWebNotificationSubscriptionStorageKey(webId),
    );
    if (curSubscriptionsRaw) {
      const curSubscriptionsParsed = JSON.parse(curSubscriptionsRaw);
      if (Array.isArray(curSubscriptionsParsed)) {
        curSubscriptions = curSubscriptionsParsed.map((sub) => toINotificationWebSubscription(sub));
      }
    }
  } catch {}
  return curSubscriptions;
}