import { fetchClownfaceNode } from "../../util/clownFaceUtils";
import IFetcher from "../../util/IFetcher";
import Profile from "../IProfile";
import {
  SchemaPerson,
  FoafPerson,
  vcardImage,
  foafImage,
  foafName,
  vcardName,
  stroage,
} from "../../util/nodes";
import HttpError from "../../util/HttpError";

export default async function fetchExternalProfile(
  url: string,
  options: {
    fetcher?: IFetcher;
  }
): Promise<Profile> {
  // Fetch the given URL
  try {
    const profileNode = await fetchClownfaceNode(
      url,
      [SchemaPerson, FoafPerson],
      options.fetcher,
      { requireAllTypes: true }
    );

    const profileStorage =
      profileNode.out(stroage).value || `${new URL(url).origin}/`;

    // Extract profile from RDF
    const profile: Profile = {
      webId: url,
      image:
        profileNode.out(vcardImage).value || profileNode.out(foafImage).value,
      name: profileNode.out(vcardName).value || profileNode.out(foafName).value,
      defaultStorageLocation: `${profileStorage}chats/`,
    };
    return profile;
  } catch (err) {
    if (err.status === 400) {
      throw new HttpError(`${url} is not a valid WebId`, 400);
    }
    throw err;
  }
}
