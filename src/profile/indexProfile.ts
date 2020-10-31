import Profile from "./IProfile";
import fetchExternalProfile from "./externalProfile/fetchExternalProfile";
import EsClient from "../util/EsClient";
import HttpError from "../util/HttpError";
import IFetcher from "../util/IFetcher";
import { createProfileIndex } from "./profileIndexApi";

export default async function indexProfile(
  profileUrl: string,
  searchable: boolean,
  options: {
    fetcher?: IFetcher;
  }
): Promise<Profile> {
  const profile = await fetchExternalProfile(profileUrl, {
    fetcher: options.fetcher,
  });
  profile.searchable = searchable;
  return createProfileIndex(profile);
}
