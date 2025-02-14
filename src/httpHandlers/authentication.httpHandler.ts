import IHttpHandler from "./IHttpHandler";
import session from "express-session";
import URL from "url-parse";
import {
  removeAllSessionsByWebId,
  sessionManager,
  setSessionByWebId,
} from "../util/AuthSessionManager";
import getLoggedInAuthSession from "../util/getLoggedInAuthSession";
import { Request } from "express";
import HttpError from "../util/HttpError";

const hostUrl = process.env.HOST_URL || "http://localhost:9000";
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:19006";
const sessionSecret = process.env.SESSION_SECRET;
const env = process.env.ENV;

if (!sessionSecret) {
  throw new Error("SESSION_SECERET must be provided");
}

function isFromWebClient(req: Request): boolean {
  try {
    return (
      !!req.session &&
      !!req.session.redirect &&
      new URL(req.session.redirect).origin === clientOrigin
    );
  } catch (err: unknown) {
    if ((err as Error).message) {
      throw new HttpError((err as Error).message, 500, {
        requestSession: req.session,
      });
    } else {
      throw err;
    }
  }
}

const authenticationHandler: IHttpHandler = (app) => {
  app.use(
    "/auth",
    session({
      secret: sessionSecret,
      proxy: true,
      cookie: { secure: env !== "dev" },
      resave: false,
      saveUninitialized: false,
    })
  );

  app.get("/auth/login", async (req, res) => {
    const { redirect, issuer } = req.query;

    try {
      const session = await sessionManager.getSession(req.sessionID);
      if (req.session && typeof redirect === "string") {
        req.session.redirect = redirect;
      }
      await session.login({
        oidcIssuer: new URL(issuer as string),
        redirectUrl: new URL(`${hostUrl}/auth/callback`),
        handleRedirect: (redirectUrl: string) => {
          res.redirect(redirectUrl);
        },
      });
    } catch (err: unknown) {
      if ((err as Error).message) {
        throw new HttpError((err as Error).message, 500, {
          requestQuery: req.query,
        });
      } else {
        throw err;
      }
    }
  });

  app.get("/auth/callback", async (req, res) => {
    await sessionManager.handleIncomingRedirect(req.url);
    const authSession = await sessionManager.getSession(req.sessionID);
    await setSessionByWebId(authSession);
    if (req.session && req.session.redirect) {
      if (isFromWebClient(req)) {
        // If the request is coming from the client, set a cookie
        res.cookie("auth", req.sessionID, { httpOnly: true });
        res.redirect(`${req.session.redirect}?webid=${authSession.info.webId}`);
      } else {
        // otherwise send it in the redirect
        res.redirect(
          `${req.session.redirect}?key=${req.sessionID}&webid=${authSession.info.webId}`
        );
      }
    } else {
      res.status(500).send("Session problem");
    }
  });

  app.use(async (req, res, next) => {
    const authSessionId = req.headers.authorization || req.cookies.auth;
    if (!authSessionId) {
      next();
      return;
    }
    const authSession = await sessionManager.getSession(authSessionId);
    if (authSession.info.isLoggedIn) {
      req.authSession = authSession;
    }
    next();
  });

  app.get("/auth/logout/device", async (req, res) => {
    const authSession = getLoggedInAuthSession(req);
    await Promise.all([
      authSession.logout(),
      setSessionByWebId(authSession, true),
    ]);
    res.status(204).send();
  });

  app.get("/auth/logout/all", async (req, res) => {
    const authSession = getLoggedInAuthSession(req);
    await Promise.all([
      authSession.logout(),
      removeAllSessionsByWebId(authSession.info.webId),
    ]);
    res.status(204).send();
  });
};

export default authenticationHandler;
