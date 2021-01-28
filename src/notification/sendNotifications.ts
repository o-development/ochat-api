import { setVapidDetails, sendNotification } from "web-push";
import ExpoSdk from "../util/ExpoSdk";
import { Expo } from "expo-server-sdk";
import { ExpoPushMessage } from "expo-server-sdk";
import { getNotificationSubscriptionsByWebId } from "./notificationSubscriptionApi";

const vapidPublicKey = process.env.PUSH_SERVER_PUBLIC_KEY;
const vapidPrivateKey = process.env.PUSH_SERVER_PRIVATE_KEY;
const vapidEmail = process.env.PUSH_SERVER_EMAIL;
if (!vapidPublicKey || !vapidPrivateKey || !vapidEmail) {
  throw new Error(
    "Must provide PUSH_SERVER_PUBLIC_KEY, PUSH_SERVER_EMAIL, and PUSH_SERVER_PRIVATE_KEY"
  );
}
setVapidDetails(`mailto:${vapidEmail}`, vapidPublicKey, vapidPrivateKey);
const clientOrigin = process.env.CLIENT_ORIGIN;

export interface INotificationInformation {
  title: string;
  text: string;
  chatUri: string;
}

export default async function sendNotifications(
  webId: string,
  notificationInformation: INotificationInformation
): Promise<void> {
  const subscriptions = await getNotificationSubscriptionsByWebId(webId);
  if (!subscriptions) {
    return;
  }
  await Promise.all([
    Object.values(subscriptions).map(async (subscription) => {
      if (subscription.type === "web") {
        try {
          await sendNotification(
            subscription.subscription,
            JSON.stringify({
              title: notificationInformation.title,
              text: notificationInformation.text,
              image: "/favicon.ico",
              url: `${clientOrigin}/chat?id=${encodeURIComponent(
                notificationInformation.chatUri
              )}`,
            })
          );
        } catch {}
      } else if (subscription.type === "mobile") {
        if (Expo.isExpoPushToken(subscription.subscription)) {
          const message: ExpoPushMessage = {
            to: subscription.subscription,
            sound: "default",
            title: notificationInformation.title,
            body: notificationInformation.text,
            data: {
              uri: `/chat?id=${encodeURIComponent(
                notificationInformation.chatUri
              )}`,
            },
          };
          await ExpoSdk.sendPushNotificationsAsync([message]);
        } else {
          console.error("INVALID TOKEN");
        }
      }
    }),
  ]);
}
