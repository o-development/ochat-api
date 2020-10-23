import IHandler from "./IHandler";

const notificationSettingHandler: IHandler = (app) => {
  app.put("/notification-setting/:chat_url", () => {
    // TODO
  });

  app.get("/notification-setting/:chat_url", () => {
    // TODO
  });
};

export default notificationSettingHandler;
