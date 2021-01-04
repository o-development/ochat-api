import { Collection, FilterQuery } from "mongodb";
import IFetcher from "../util/IFetcher";
import IProfile, { toProfile } from "./IProfile";
import { getProfileCollection } from "../util/MongoClient";
import { isUri } from "../util/toUri";
import fetchExternalProfile from "./externalProfile/fetchExternalProfile";
import { any as promiseAny } from "bluebird";
import { retrieveProfileIndex } from "./profileIndexApi";

export default async function searchProfiles(
  searchOptions: {
    term: string;
    page: number;
    limit: number;
  },
  options?: { fetcher?: IFetcher }
): Promise<IProfile[]> {
  const profileCollection: Collection<IProfile> = await getProfileCollection();
  const searchTerm = searchOptions.term;
  if (isUri(searchTerm)) {
    // Search for WebIds
    try {
      // Get the profile from the pod or the internal database
      return [
        await promiseAny<IProfile>([
          fetchExternalProfile(searchTerm, { fetcher: options?.fetcher }),
          retrieveProfileIndex(searchTerm),
        ]),
      ];
    } catch (err) {
      return [];
    }
  } else {
    // Search DB
    const profileSearchQuery: FilterQuery<IProfile> = {
      searchable: true,
      $text: {
        $search: searchTerm,
      },
    };
    const profiles = await profileCollection
      .find(profileSearchQuery)
      .skip(searchOptions.page * searchOptions.limit)
      .limit(searchOptions.limit)
      .toArray();
    return profiles.map((profile) => toProfile(profile));
  }
}
