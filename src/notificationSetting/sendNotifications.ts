import { setVapidDetails, sendNotification } from "web-push";
import { getWebNotificationSubscriptionsById } from "./registerWebNotificationSubscription";

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
            url: `/chat?id=${encodeURIComponent(notificationInformation.chatUri)}`
          }))
        } catch {}
      }));
    })()
  ])
}