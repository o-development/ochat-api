import IHttpHandler from "./IHttpHandler";
import indexProfile from "../profile/indexProfile";
import getLoggedInAuthSession from "../util/getLoggedInAuthSession";
import { retrieveProfileIndex } from "../profile/profileIndexApi";

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

  app.post("/profile/search", async () => {
    throw new Error("Not Implemented");
  });
};

export default profileHandler;
