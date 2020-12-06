import IFetcher from "../util/IFetcher";
import { getChatCollection, getProfileCollection } from "../util/MongoClient";
import IChat from "./IChat";
import IProfile from "src/profile/IProfile";
import { FilterQuery } from "mongodb";

export default async function searchChats(
  searchOptions: {
    includeProfiles?: boolean;
    page: number;
    limit: number;
    term?: string;
  },
  options: { fetcher?: IFetcher; webId: string }
): Promise<{ chats: IChat[]; profiles?: IProfile[] }> {
  const chatCollection = await getChatCollection();
  const profileCollection = await getProfileCollection();

  const chatSearchQuery: FilterQuery<IChat> = {
    "participants.webId": options.webId,
  };
  if (searchOptions.term) {
    chatSearchQuery.$text = { $search: searchOptions.term };
  }
  const chatPromise: Promise<IChat[]> = chatCollection
    .find(chatSearchQuery)
    .sort({ "lastMessage.timeCreated": -1 })
    .skip(searchOptions.page)
    .limit(searchOptions.limit)
    .toArray();

  let profilePromise: Promise<IProfile[]> = Promise.resolve([]);
  if (searchOptions.includeProfiles) {
    const profileSearchQuery: FilterQuery<IProfile> = {
      searchable: true,
    };
    if (searchOptions.term) {
      profileSearchQuery.$text = { $search: searchOptions.term };
    }
    profilePromise = profileCollection
      .find(profileSearchQuery)
      .skip(searchOptions.page)
      .limit(searchOptions.limit)
      .toArray();
  }
  const [chats, profiles] = await Promise.all([chatPromise, profilePromise]);
  return {
    chats,
    profiles,
  };
}
