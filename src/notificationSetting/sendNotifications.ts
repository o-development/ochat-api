import { setVapidDetails, sendNotification } from "web-push";
import { getWebNotificationSubscriptionsById } from "./registerWebNotificationSubscription";
import { getMobileNotificationSubscriptionsById } from "./registerMobileNotificationSubscription";
import ExpoSdk from '../util/ExpoSdk';
import { Expo } from 'expo-server-sdk';
import { ExpoPushMessage } from "expo-server-sdk";

const vapidPublicKey = process.env.PUSH_SERVER_PUBLIC_KEY;
const vapidPrivateKey = process.env.PUSH_SERVER_PRIVATE_KEY;
const vapidEmail = process.env.PUSH_SERVER_EMAIL;
if (!vapidPublicKey || !vapidPrivateKey || !vapidEmail) {
  throw new Error('Must provide PUSH_SERVER_PUBLIC_KEY, PUSH_SERVER_EMAIL, and PUSH_SERVER_PRIVATE_KEY');
}
setVapidDetails(
  `mailto:${vapidEmail}`,
  vapidPublicKey,
  vapidPrivateKey
)
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
  await Promise.all([
    (async () => {
      // Web notifications
      const webSubscriptions = await getWebNotificationSubscriptionsById(webId);
      await Promise.all(webSubscriptions.map(async (webSubscription) => {
        try {
          await sendNotification(webSubscription, JSON.stringify({
            title: notificationInformation.title,
            text: notificationInformation.text,
            image: '/favicon.ico',
            url: `${clientOrigin}/chat?id=${encodeURIComponent(notificationInformation.chatUri)}`
          }))
        } catch { }
      }));
    })(),
    (async () => {
      // Mobile notifications
      const tokens = await getMobileNotificationSubscriptionsById(webId);
      const messages: ExpoPushMessage[] = [];
      tokens.forEach((token) => {
        if (Expo.isExpoPushToken(token)) {
          messages.push({
            to: token,
            sound: 'default',
            title: notificationInformation.title,
            body: notificationInformation.text,
            data: {
              uri: `/chat?id=${encodeURIComponent(notificationInformation.chatUri)}`
            }
          });
        } else {
          console.error('INVALID TOKEN');
        }
      });
      const chunks = ExpoSdk.chunkPushNotifications(messages);
      Promise.all(chunks.map(async (chunk) => {
        await ExpoSdk.sendPushNotificationsAsync(chunk);
      }));
    })()
  ])
}