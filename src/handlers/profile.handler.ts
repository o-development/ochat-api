import IHandler from "./IHandler";
import HttpError from "../util/HttpError";
import indexProfile from "../search/profile/indexProfile";

const profileHandler: IHandler = (app) => {
  app.get("/profile/authenticated", () => {
    // TODO
  });

  app.post("/profile/authenticated", async (req, res) => {
    if (!req.authSession) {
      throw new HttpError("Must be logged in to index profile", 403);
    }
    const searchable = req.query.searchable === "true";
    const webId = req.authSession.info.webId;
    if (!webId) {
      throw new HttpError("Auth session did not have an associated WebId", 500);
    }
    const profile = await indexProfile(
      webId,
      searchable,
      req.authSession.fetch.bind(req.authSession)
    );
    res.status(201).send(profile);
  });

  app.post("/profile/search", () => {
    // TODO
  });
};

export default profileHandler;
