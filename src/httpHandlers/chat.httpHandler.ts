import IHttpHandler from "./IHttpHandler";
import { toIChat, toIChatPartial } from "../chat/IChat";
import newChat from "../chat/newChat";
import HttpError from "../util/HttpError";
import searchChats from "../chat/searchChats";
import toUri from "../util/toUri";
import getLoggedInAuthSession from "../util/getLoggedInAuthSession";
import newChatIndex from "../chat/newChatIndex";
import updateChatIndex from "../chat/updateChatIndex";
import getChatIndex from "../chat/getChatIndex";

const chatHandler: IHttpHandler = (app) => {
  // New Chat
  app.post("/chat", async (req, res) => {
    const chat = toIChat(req.body);
    const authSession = getLoggedInAuthSession(req);
    const savedChat = await newChat(chat, {
      fetcher: authSession.fetch.bind(req.authSession),
      webId: authSession.info.webId,
    });
    res.status(201).send(savedChat);
  });

  // Search Chats
  // query: term, page, limit
  app.post("/chat/search", async (req, res) => {
    const authSession = getLoggedInAuthSession(req);
    if (
      (req.query.term && typeof req.query.term !== "string") ||
      (req.query.page && typeof req.query.page !== "string") ||
      (req.query.limit && typeof req.query.limit !== "string")
    ) {
      throw new HttpError(
        "Only one parameter is allowed for term, page, and limit",
        400
      );
    }
    const term = req.query.term;
    const page = parseInt(req.query.page || "0");
    const limit = parseInt(req.query.limit || "10");
    const includeProfiles = !!term;
    const searchResults = await searchChats(
      { term, page, limit, includeProfiles },
      {
        fetcher: authSession.fetch.bind(req.authSession),
        webId: authSession.info.webId,
      }
    );
    res.status(200).send(searchResults);
  });

  // Get Chat Index
  app.get("/chat/:chat_uri", async (req, res) => {
    const authSession = getLoggedInAuthSession(req);
    const chatUri = toUri(req.params.chat_uri);
    const chat = await getChatIndex(chatUri, {
      webId: authSession.info.webId,
    });
    res.status(200).send(chat);
  });

  // New Chat Index
  app.post("/chat/:chat_uri", async (req, res) => {
    const authSession = getLoggedInAuthSession(req);
    const chatUri = toUri(req.params.chat_uri);
    const newChat = await newChatIndex(chatUri, {
      fetcher: authSession.fetch.bind(req.authSession),
      webId: authSession.info.webId,
    });
    res.status(201).send(newChat);
  });

  // Update Chat Index
  app.put("/chat/:chat_url", async (req, res) => {
    const authSession = getLoggedInAuthSession(req);
    const chatUri = toUri(req.params.chat_url);
    const chatData = toIChatPartial(req.body);
    const savedChat = await updateChatIndex(chatUri, chatData, {
      webId: authSession.info.webId,
      fetcher: authSession.fetch.bind(authSession),
    });
    res.status(200).send(savedChat);
  });
};

export default chatHandler;
