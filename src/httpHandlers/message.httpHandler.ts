import toUri from "../util/toUri";
import getLoggedInAuthSession from "../util/getLoggedInAuthSession";
import IHttpHandler from "./IHttpHandler";
import getChatMessages from "../message/getChatMessages";
import { toIMessageCreationData } from "../message/IMessage";
import createChatMessage from "../message/createChatMessage";
import IFetcher from "src/util/IFetcher";

const messageHandler: IHttpHandler = (app) => {
  app.get("/message/:chat_uri", async (req, res) => {
    let fetcher: IFetcher | undefined;
    try {
      const authSession = getLoggedInAuthSession(req);
      fetcher = authSession.fetch.bind(authSession)
    } catch {
      // Do nothing
    }
    const chatUri = toUri(req.params.chat_uri);
    let previousPageId: string | undefined = undefined;
    if (
      req.query.previous_page_id &&
      typeof req.query.previous_page_id === "string"
    ) {
      previousPageId = req.query.previous_page_id;
    }
    const messages = await getChatMessages(chatUri, previousPageId, {
      fetcher,
    });
    res.status(200).send(messages);
  });

  app.post("/message/:chat_uri", async (req, res) => {
    const authSession = getLoggedInAuthSession(req);
    const chatUri = toUri(req.params.chat_uri);
    const message = toIMessageCreationData(req.body);
    const createdMessage = await createChatMessage(chatUri, message, {
      fetcher: authSession.fetch.bind(authSession),
      webId: authSession.info.webId,
    });
    res.status(201).send(createdMessage);
  });
};

export default messageHandler;
