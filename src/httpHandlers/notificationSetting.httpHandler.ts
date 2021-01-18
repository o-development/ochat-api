import IHttpHandler from "./IHttpHandler";
import { toINotificationWebSubscription } from "../notificationSetting/INotificationWebSubscriptionRequest";
import getLoggedInAuthSession from "../util/getLoggedInAuthSession";
import { registerWebNotificationSubscription } from '../notificationSetting/registerWebNotificationSubscription';
import { registerMobileNotificationSubscription } from '../notificationSetting/registerMobileNotificationSubscription';
import HttpError from "../util/HttpError";

const notificationSettingHandler: IHttpHandler = (app) => {
  app.post("/notification/web-subscription", async (req, res) => {
    const notificationWebSubscriptionRequest = toINotificationWebSubscription(req.body);
    const authSession = getLoggedInAuthSession(req);
    await registerWebNotificationSubscription(
      notificationWebSubscriptionRequest,
      { webId: authSession.info.webId }
    );
    res.status(201).send();
  });

  app.post("/notification/mobile-subscription", async (req, res) => {
    if (!req.body || typeof req.body.token !== 'string') {
      throw new HttpError('Token must be present and a string.', 400);
    }
    const token = req.body.token as string;
    const authSession = getLoggedInAuthSession(req);
    await registerMobileNotificationSubscription(
      token,
      { webId: authSession.info.webId }
    );
    res.status(201).send();
  });

  app.put("/notification-setting/:chat_url", () => {
    // TODO
  });

  app.get("/notification-setting/:chat_url", () => {
    // TODO
  });
};

export default notificationSettingHandler;
