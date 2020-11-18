import toUri from "../util/toUri";
import getLoggedInAuthSession from "../util/getLoggedInAuthSession";
import IHandler from "./IHandler";
import getChatMessages from "../message/getChatMessages";

const messageHandler: IHandler = (app) => {
  app.get("/message/:chat_uri", async (req, res) => {
    const authSession = getLoggedInAuthSession(req);
    const chatUri = toUri(req.params.chat_uri);
    let previousPageId: string | undefined = undefined;
    if (
      req.query.previous_page_id &&
      typeof req.query.previous_page_id === "string"
    ) {
      previousPageId = req.query.previous_page_id;
    }
    const messages = await getChatMessages(chatUri, previousPageId, {
      fetcher: authSession.fetch.bind(authSession),
    });
    res.status(200).send(messages);
  });

  app.post("/message/:chat_url", () => {
    // TODO
  });
};

export default messageHandler;
