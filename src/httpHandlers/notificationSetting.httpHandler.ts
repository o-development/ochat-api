import IHttpHandler from "./IHttpHandler";
import getLoggedInAuthSession from "../util/getLoggedInAuthSession";
import HttpError from "../util/HttpError";
import { createNotificationSubscription, deleteNotificationSubscription, getNotificationSubscription } from '../notification/notificationSubscriptionApi';
import { toINotificationSubscription } from '../notification/INotificationSubscription';

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

  app.put("/notification-setting/:chat_url", () => {
    // TODO
  });

  app.get("/notification-setting/:chat_url", () => {
    // TODO
  });
};

export default notificationSettingHandler;
