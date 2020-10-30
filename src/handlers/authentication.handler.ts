import IHandler from "./IHandler";
import session from "express-session";
import URL from "url-parse";
import { sessionManager, setSessionByWebId } from "../util/AuthSessionManager";

const hostUrl = process.env.HOST_URL || "http://localhost:9000";

const authenticationHandler: IHandler = (app) => {
  app.use(
    "/auth",
    session({
      secret: "I let Kevin's son beat me in foosball",
      cookie: { secure: false },
    })
  );

  app.get("/auth/login", async (req, res) => {
    const { redirect, issuer } = req.query;

    const session = await sessionManager.getSession(req.sessionID);
    if (req.session) {
      req.session.redirect = redirect;
    }
    await session.login({
      oidcIssuer: new URL(issuer as string),
      redirectUrl: new URL(`${hostUrl}/auth/callback`),
      handleRedirect: (redirectUrl) => {
        res.redirect(redirectUrl);
      },
    });
  });

  app.get("/auth/callback", async (req, res) => {
    await sessionManager.handleIncomingRedirect(req.url);
    const authSession = await sessionManager.getSession(req.sessionID);
    await setSessionByWebId(authSession);
    if (req.session && req.session.redirect) {
      res.redirect(
        `${req.session.redirect}?key=${req.sessionID}&webid=${authSession.info.webId}`
      );
    } else {
      res.status(500).send("Session problem");
    }
  });

  app.use(async (req, res, next) => {
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
  });
};

export default authenticationHandler;
