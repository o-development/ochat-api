import HttpError from "../util/HttpError";
import redisClient from "../util/RedisConnection";
import {
  INotificationSubscription,
  toINotificationSubscription,
} from "./INotificationSubscription";

export function getNotificationSubscriptionStorageKey(key: string): string {
  return `notificationSubscription:${key}`;
}

export async function getNotificationSubscriptionsByWebId(
  webId: string
): Promise<Record<string, INotificationSubscription> | undefined> {
  const subscriptionsRaw = await redisClient.get(
    getNotificationSubscriptionStorageKey(webId)
  );
  if (!subscriptionsRaw) {
    return undefined;
  }
  let subscriptionsParsed: Record<string, unknown>;
  try {
    subscriptionsParsed = JSON.parse(subscriptionsRaw);
    if (!subscriptionsParsed || subscriptionsParsed.constructor !== Object) {
      throw new Error("Not a record");
    }
  } catch {
    await redisClient.del(getNotificationSubscriptionStorageKey(webId));
    return undefined;
  }
  Object.entries(subscriptionsParsed).forEach(([key, value]) => {
    try {
      toINotificationSubscription(value);
    } catch {
      delete subscriptionsParsed[key];
    }
  });
  return subscriptionsParsed as Record<string, INotificationSubscription>;
}

export async function getNotificationSubscription(
  webId: string,
  clientId: string
): Promise<INotificationSubscription> {
  const curSubscriptions = await getNotificationSubscriptionsByWebId(webId);
  if (!curSubscriptions || !curSubscriptions[clientId]) {
    throw new HttpError("Subscription does not exist", 404);
  }
  return curSubscriptions[clientId];
}

export async function createNotificationSubscription(
  webId: string,
  clientId: string,
  subscription: INotificationSubscription
): Promise<void> {
  const curSubscriptions =
    (await getNotificationSubscriptionsByWebId(webId)) || {};
  curSubscriptions[clientId] = subscription;
  await redisClient.set(
    getNotificationSubscriptionStorageKey(webId),
    JSON.stringify(curSubscriptions)
  );
}

export async function deleteNotificationSubscription(
  webId: string,
  clientId: string
): Promise<void> {
  const curSubscriptions =
    (await getNotificationSubscriptionsByWebId(webId)) || {};
  delete curSubscriptions[clientId];
  await redisClient.set(
    getNotificationSubscriptionStorageKey(webId),
    JSON.stringify(curSubscriptions)
  );
}
