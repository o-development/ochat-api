import { RequestHandler } from "express";
import { sessionManager } from "../util/AuthSessionManager";

const extractAuth: RequestHandler = async (req, res, next) => {
  const authSessionId = req.headers.authorization;
  if (!authSessionId) {
    next();
    return;
  }
  const authSession = await sessionManager.getSession(authSessionId);
  if (authSession.info.isLoggedIn) {
    req.authSession = authSession;
  }
  next();
};

export default extractAuth;
