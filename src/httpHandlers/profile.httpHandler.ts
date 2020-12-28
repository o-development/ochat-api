import IHttpHandler from "./IHttpHandler";
import indexProfile from "../profile/indexProfile";
import getLoggedInAuthSession from "../util/getLoggedInAuthSession";
import { retrieveProfileIndex } from "../profile/profileIndexApi";
import HttpError from "../util/HttpError";
import searchProfiles from "../profile/searchProfiles";

const profileHandler: IHttpHandler = (app) => {
  app.get("/profile/authenticated", async (req, res) => {
    const authSession = getLoggedInAuthSession(req);
    const profile = await retrieveProfileIndex(authSession.info.webId);
    res.status(200).send(profile);
  });

  app.post("/profile/authenticated", async (req, res) => {
    const authSession = getLoggedInAuthSession(req);
    const searchable = req.query.searchable === "true";
    const profile = await indexProfile(authSession.info.webId, searchable, {
      fetcher: authSession.fetch.bind(authSession),
    });
    res.status(201).send(profile);
  });

  app.post("/profile/search", async (req, res) => {
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
    const term = req.query.term || "";
    const page = parseInt(req.query.page || "0");
    const limit = parseInt(req.query.limit || "10");
    const profiles = await searchProfiles(
      { term, page, limit },
      { fetcher: authSession.fetch.bind(authSession) }
    );
    res.status(200).send(profiles);
  });
};

export default profileHandler;
