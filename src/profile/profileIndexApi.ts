import HttpError from "../util/HttpError";
import { getProfileCollection } from "../util/MongoClient";
import IProfile, { toProfile } from "./IProfile";

export async function createProfileIndex(profile: IProfile): Promise<IProfile> {
  const profileCollection = await getProfileCollection();
  try {
    await profileCollection.insertOne({
      ...profile,
    });
    return profile;
  } catch (err) {
    if (err.code === 11000) {
      throw new HttpError(`${profile.webId} is already indexed.`, 409, {
        uri: profile.webId,
      });
    }
    throw err;
  }
}

export async function retrieveProfileIndex(url: string): Promise<IProfile> {
  const profileCollection = await getProfileCollection();
  const profile = await profileCollection.findOne({ webId: url });
  console.log(profile);
  if (profile) {
    return toProfile(profile);
  } else {
    throw new HttpError(`Profile ${url} not found.`, 404, { uri: url });
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
