import IHttpHandler from "./IHttpHandler";
import { toINotificationWebSubscription } from "../notificationSetting/INotificationWebSubscriptionRequest";
import getLoggedInAuthSession from "../util/getLoggedInAuthSession";
import { registerWebNotificationSubscription } from '../notificationSetting/registerWebNotificationSubscription';

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

  app.put("/notification-setting/:chat_url", () => {
    // TODO
  });

  app.get("/notification-setting/:chat_url", () => {
    // TODO
  });
};

export default notificationSettingHandler;
