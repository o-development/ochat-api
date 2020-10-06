import { RequestHandler } from "express";
import { sessionManager } from "../util/AuthSessionManager";

const indexProfileHandler: RequestHandler = async (req, res) => {
  console.log("IN IT");
  const authSessionId = req.headers.authorization;
  console.log(authSessionId);
  const authSession = await sessionManager.getSession(authSessionId);
  console.log(authSession.info.webId);
  const response = await authSession.fetch(
    "https://jackson.solid.community/private/chatsStorage.ttl"
  );
  const text = await response.text();
  console.log("text");
  res.send(text);
};

export default indexProfileHandler;
