import IHandler from "./IHandler";
import session from "express-session";
import URL from "url-parse";
import { sessionManager, setSessionByWebId } from "../util/AuthSessionManager";

const hostUrl = process.env.HOST_URL || "http://localhost:9000";
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:19006";
const sessionSecret = process.env.SESSION_SECRET;
const env = process.env.ENV;

if (!sessionSecret) {
  throw new Error("SESSION_SECERET must be provided");
}

const authenticationHandler: IHandler = (app) => {
  app.use(
    "/auth",
    session({
      secret: sessionSecret,
      cookie: { secure: env !== "dev" },
    })
  );

  app.get("/auth/login", async (req, res) => {
    console.log("LOGIN");
    console.log(req.sessionID);
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
    console.log("CALLBACK");
    console.log(req.sessionID);
    await sessionManager.handleIncomingRedirect(req.url);
    const authSession = await sessionManager.getSession(req.sessionID);
    console.log(authSession);
    await setSessionByWebId(authSession);
    if (req.session && req.session.redirect) {
      if (new URL(req.session.redirect).origin === clientOrigin) {
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
};

export default authenticationHandler;
