import { Session } from "@inrupt/solid-auth-fetcher";
import { Request } from "express";
import HttpError from "./HttpError";

interface ILoggedInAuthSession extends Session {
  info: {
    isLoggedIn: true;
    webId: string;
    sessionId: string;
  };
}

export default function getLoggedInAuthSession(
  req: Request
): ILoggedInAuthSession {
  if (
    !req.authSession ||
    !req.authSession.info.webId ||
    !req.authSession.info.isLoggedIn
  ) {
    throw new HttpError("Must be logged in", 403);
  }
  return req.authSession as ILoggedInAuthSession;
}
