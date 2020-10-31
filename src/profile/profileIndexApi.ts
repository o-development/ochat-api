import EsClient from "../util/EsClient";
import HttpError from "../util/HttpError";
import IProfile, { toProfile } from "./IProfile";

export async function createProfileIndex(profile: IProfile): Promise<IProfile> {
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

export async function retrieveProfileIndex(url: string): Promise<IProfile> {
  try {
    const { body } = await EsClient.get({
      id: url,
      index: "profile",
    });
    return toProfile(body);
  } catch (err) {
    if (err.meta?.statusCode === 404) {
      throw new HttpError(`Profile ${url} not found.`, 404);
    }
    throw err;
  }
}

export async function updateProfileIndex(
  partialProfile: Partial<IProfile>
): Promise<IProfile> {
  // TODO
  throw new Error("not implemented");
}

export async function deleteProfileIndex(url: string): Promise<IProfile> {
  throw new Error("not implemented");
}
