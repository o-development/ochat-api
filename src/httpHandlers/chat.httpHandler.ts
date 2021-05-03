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
import addParticipantToPublicChat from "../chat/addParticipantToPublicChat";
import loadChatsByTypeIndex from "../chat/loadChatsByTypeIndex";

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
      (req.query.limit && typeof req.query.limit !== "string") ||
      (req.query.discoverable && typeof req.query.discoverable !== "string")
    ) {
      throw new HttpError(
        "Only one parameter is allowed for term, page, limit, and discoverable",
        400
      );
    }
    const term = req.query.term;
    const page = parseInt(req.query.page || "0");
    const limit = parseInt(req.query.limit || "10");
    const discoverable = Boolean(req.query.discoverable);
    const includeProfiles = !!term;
    const searchResults = await searchChats(
      { term, page, limit, includeProfiles, discoverable },
      {
        fetcher: authSession.fetch.bind(req.authSession),
        webId: authSession.info.webId,
      }
    );
    res.status(200).send(searchResults);
  });

  // Get Chat Index
  app.get("/chat/:chat_uri", async (req, res) => {
    let webId: string;
    try {
      const autSession = getLoggedInAuthSession(req);
      webId = autSession.info.webId;
    } catch {
      webId = "public";
    }
    const chatUri = toUri(req.params.chat_uri);
    const chat = await getChatIndex(chatUri, {
      webId,
    });
    res.status(200).send(chat);
  });

  // New chat indicies based on logged in user
  app.post("/chat/authenticated", async (req, res) => {
    const authSession = getLoggedInAuthSession(req);
    await loadChatsByTypeIndex({
      fetcher: authSession.fetch.bind(authSession),
      webId: authSession.info.webId,
    });
    res.status(201).send();
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

  // Add a participant to a public chat
  app.put("/chat/:chat_url/authenticated", async (req, res) => {
    const authSession = getLoggedInAuthSession(req);
    const chatUri = toUri(req.params.chat_url);
    await addParticipantToPublicChat(chatUri, authSession.info.webId);
    res.status(200).send();
  });
};

export default chatHandler;
