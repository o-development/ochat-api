import IHttpHandler from "./IHttpHandler";

const notificationSettingHandler: IHttpHandler = (app) => {
  app.put("/notification-setting/:chat_url", () => {
    // TODO
  });

  app.get("/notification-setting/:chat_url", () => {
    // TODO
  });
};

export default notificationSettingHandler;
