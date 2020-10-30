import IHandler from "./IHandler";
import indexProfile from "../profile/indexProfile";
import getLoggedInAuthSession from "../util/getLoggedInAuthSession";

const profileHandler: IHandler = (app) => {
  app.get("/profile/authenticated", () => {
    // TODO
  });

  app.post("/profile/authenticated", async (req, res) => {
    const authSession = getLoggedInAuthSession(req);
    const searchable = req.query.searchable === "true";
    const profile = await indexProfile(
      authSession.info.webId,
      searchable,
      authSession.fetch.bind(req.authSession)
    );
    res.status(201).send(profile);
  });

  app.post("/profile/search", () => {
    // TODO
  });
};

export default profileHandler;
