import { RequestHandler } from "express";
import indexChat from "../search/chat/indexChat/indexChat";
import HttpError from "../util/HttpError";

const indexChatHandler: RequestHandler = async (req, res, next) => {
  try {
    const chatUri = req.query.uri;
    if (typeof chatUri === "string") {
      const chat = await indexChat(chatUri);
      res.send(chat);
    } else {
      throw new HttpError("There should only be one chat uri", 400);
    }
  } catch (err) {
    next(err);
  }
};

export default indexChatHandler;
