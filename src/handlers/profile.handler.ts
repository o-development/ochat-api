import IHandler from "./IHandler";
import indexProfile from "../profile/indexProfile";
import getLoggedInAuthSession from "../util/getLoggedInAuthSession";
import { retrieveProfileIndex } from "../profile/profileIndexApi";

const profileHandler: IHandler = (app) => {
  app.get("/profile/authenticated", async (req, res) => {
    console.log("herere");
    const authSession = getLoggedInAuthSession(req);
    const profile = await retrieveProfileIndex(authSession.info.webId);
    res.status(200).send(profile);
  });

  app.post("/profile/authenticated", async (req, res) => {
    const authSession = getLoggedInAuthSession(req);
    const searchable = req.query.searchable === "true";
    const profile = await indexProfile(authSession.info.webId, searchable, {
      fetcher: authSession.fetch.bind(req.authSession),
    });
    res.status(201).send(profile);
  });

  app.post("/profile/search", () => {
    // TODO
  });
};

export default profileHandler;
