import fetchClownFace from "../../util/fetchClownFace";
import IFetcher from "../../util/IFetcher";
import Profile from "../IProfile";
import { namedNode } from "@rdfjs/data-model";
import {
  rdfType,
  SchemaPerson,
  FoafPerson,
  vcardImage,
  foafImage,
  foafName,
  vcardName,
} from "../../util/nodes";
import HttpError from "../../util/HttpError";

export default async function fetchExternalProfile(
  url: string,
  options: {
    fetcher?: IFetcher;
  }
): Promise<Profile> {
  // Fetch the given URL
  const cf = await fetchClownFace(url, options.fetcher);

  let profileNode = cf.namedNode(namedNode(url));

  // Check to see if the profile node is really a profile
  const profileNodeTypeValues = profileNode.out(rdfType).values;
  if (
    !(
      profileNodeTypeValues.includes(SchemaPerson.value) &&
      profileNodeTypeValues.includes(FoafPerson.value)
    )
  ) {
    // Check to see if there is a node that has the proper values
    const possibleProfileNodes = cf.has(rdfType, [SchemaPerson, FoafPerson])
      .values;
    if (possibleProfileNodes.length > 0) {
      profileNode = cf.namedNode(namedNode(possibleProfileNodes[0]));
    } else {
      throw new HttpError(`"${url}" does not contain a profile.`, 400);
    }
  }

  // Extract profile from RDF
  const profile: Profile = {
    webId: profileNode.value,
    image:
      profileNode.out(vcardImage).value || profileNode.out(foafImage).value,
    name: profileNode.out(vcardName).value || profileNode.out(foafName).value,
  };
  return profile;
}
