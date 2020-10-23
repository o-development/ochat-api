import IHandler from "./IHandler";
import oneSignalClient from "../util/OneSignalClient";
import { HTTPError as OneSignalHTTPError } from "onesignal-node";

const chatHandler: IHandler = (app) => {
  app.post("/chat", () => {
    // TODO
  });

  app.post("/chat/search", async (req, res) => {
    // See all fields: https://documentation.onesignal.com/reference/create-notification
    const notification = {
      contents: {
        tr: "Yeni bildirim",
        en: "New notification",
      },
      included_segments: ["Subscribed Users"],
    };

    // using async/await
    try {
      const response = await oneSignalClient.createNotification(notification);
      console.log(response);
      console.log(response.body.id);
    } catch (e) {
      console.log(1.5);
      console.log(e.message);
      if (e instanceof OneSignalHTTPError) {
        // When status code of HTTP response is not 2xx, HTTPError is thrown.
        console.log(2);
        console.log(e.statusCode);
        console.log(e.body);
      }
    }

    res.send("Cool stuff");
  });

  app.get("/chat/:chat_url", () => {
    // TODO
  });

  app.post("/chat/:chat_url", () => {
    // TODO
  });

  app.put("/chat/:chat_url", () => {
    // TODO
  });
};

export default chatHandler;