import { RequestHandler } from "express";
import { sessionManager } from "../util/AuthSessionManager";

const indexProfileHandler: RequestHandler = async (req, res) => {
  const authSessionId = req.headers.authorization;
  const authSession = await sessionManager.getSession(authSessionId);
  const response = await authSession.fetch(
    "https://jackson2.inrupt.net/private/roadmap/index.ttl"
  );
  const text = await response.text();
  res.send(text);
};

export default indexProfileHandler;
