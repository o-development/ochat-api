import Profile from "./Profile";
import fetcherType from "../../util/fetcherType";
import getProfile from "./getProfile";
import EsClient from "../../util/EsClient";
import HttpError from "src/util/HttpError";

export default async function indexProfile(
  profileUrl: string,
  fetcher?: fetcherType
): Promise<Profile> {
  const profile = await getProfile(profileUrl, fetcher);
  try {
    await EsClient.create({
      id: profile.webId,
      index: "profile",
      body: profile,
    });
    return profile;
  } catch (err) {
    if (err.meta?.statusCode === 409) {
      throw new HttpError(`${profile.webId} already indexed`, 409);
    }
    throw err;
  }
}
