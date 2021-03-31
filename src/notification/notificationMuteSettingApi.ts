import INotificationMuteSetting, { toINotificationMuteSetting } from "./INotificationMuteSetting";
import redisClient from "../util/RedisConnection";

function getMuteStatusKey(chatUri: string, webId: string) {
  return `notificationMuteSetting:${webId}:${chatUri}`;
}

export async function muteChat(setting: INotificationMuteSetting, webId: string): Promise<void> {
  if (setting.expires) {
    await redisClient.set(
      getMuteStatusKey(setting.chatUri, webId),
      JSON.stringify(setting),
      'PX',
      setting.expires.duration
    );
  } else {
    await redisClient.set(
      getMuteStatusKey(setting.chatUri, webId),
      JSON.stringify(setting),
    );
  }
}

export async function getChatMuteSetting(
  chatId: string,
  webId: string,
): Promise<INotificationMuteSetting | null> {
  const rawMuteSetting = await redisClient.get(getMuteStatusKey(chatId, webId));
  if (!rawMuteSetting) {
    return null;
  }
  return toINotificationMuteSetting(JSON.parse(rawMuteSetting));
}

export async function unMuteChat(chatId: string, webId: string) {
  await redisClient.del(getMuteStatusKey(chatId, webId));
}
