import IHttpHandler from "./IHttpHandler";
import getLoggedInAuthSession from "../util/getLoggedInAuthSession";
import HttpError from "../util/HttpError";
import { createNotificationSubscription, deleteNotificationSubscription, getNotificationSubscription } from '../notification/notificationSubscriptionApi';
import { toINotificationSubscription } from '../notification/INotificationSubscription';
import { toINotificationMuteSetting } from '../notification/INotificationMuteSetting';
import { muteChat, unMuteChat, getChatMuteSetting } from '../notification/notificationMuteSettingApi';
import toUri from "../util/toUri";

const notificationSettingHandler: IHttpHandler = (app) => {
  app.get("/notification/subscription/:clientId", async (req, res) => {
    const authSession = getLoggedInAuthSession(req);
    if (typeof req.params.clientId !== 'string') {
      throw new HttpError('Must provide clientId param.', 400);
    }
    const subscription = await getNotificationSubscription(authSession.info.webId, req.params.clientId);
    res.json(subscription);
  });

  app.post("/notification/subscription/:clientId", async (req, res) => {
    const notificationWebSubscriptionRequest = toINotificationSubscription(req.body);
    const authSession = getLoggedInAuthSession(req);
    if (typeof req.params.clientId !== 'string') {
      throw new HttpError('Must provide clientId param.', 400);
    }
    await createNotificationSubscription(
      authSession.info.webId,
      req.params.clientId,
      notificationWebSubscriptionRequest,
    );
    res.status(201).send();
  });

  app.delete("/notification/subscription/:clientId", async (req, res) => {
    const authSession = getLoggedInAuthSession(req);
    if (typeof req.params.clientId !== 'string') {
      throw new HttpError('Must provide clientId param.', 400);
    }
    await deleteNotificationSubscription(
      authSession.info.webId,
      req.params.clientId,
    );
    res.status(200).send();
  })

  app.post("/notification-mute-setting", async (req, res) => {
    const authSession = getLoggedInAuthSession(req);
    const notificationMuteSetting = toINotificationMuteSetting(req.body);
    await muteChat(notificationMuteSetting, authSession.info.webId);
    res.status(200).send();
  });

  app.get("/notification-mute-setting/:chat_uri", async (req, res) => {
    const authSession = getLoggedInAuthSession(req);
    const chatUri = toUri(req.params.chat_uri);
    const setting = await getChatMuteSetting(chatUri, authSession.info.webId);
    if (setting) {
      res.status(200).send(setting);
    } else {
      res.status(404).send();
    }
  });

  app.delete("/notification-mute-setting/:chat_uri", async (req, res) => {
    const authSession = getLoggedInAuthSession(req);
    const chatUri = toUri(req.params.chat_uri);
    await unMuteChat(chatUri, authSession.info.webId);
    res.status(200).send();
  });
};

export default notificationSettingHandler;
