import { RequestHandler } from "express";
import HttpError from "../util/HttpError";
import indexProfile from "../search/profile/indexProfile";

const indexAuthorizedProfileHandler: RequestHandler = async (req, res) => {
  if (!req.authSession) {
    throw new HttpError("Must be logged in to index profile", 403);
  }
  const webId = req.authSession.info.webId;
  if (!webId) {
    throw new HttpError("Auth session did not have an associated WebId", 500);
  }
  const profile = await indexProfile(
    webId,
    req.authSession.fetch.bind(req.authSession)
  );
  res.status(201).send(profile);
};

export default indexAuthorizedProfileHandler;
