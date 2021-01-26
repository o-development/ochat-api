import IFetcher from "../util/IFetcher";
import { getChatCollection } from "../util/MongoClient";
import IChat from "./IChat";
import IProfile from "../profile/IProfile";
import { FilterQuery } from "mongodb";
import searchProfiles from "../profile/searchProfiles";

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

  let chatSearchQuery: FilterQuery<IChat> = {
    "participants.webId": options.webId,
  };
  if (searchOptions.term) {
    chatSearchQuery = {
      $or: [
        chatSearchQuery,
        {
          isPublic: true,
        }
      ],
      $text: { $search: searchOptions.term }
    }
  }
  const chatPromise: Promise<IChat[]> = chatCollection
    .find(chatSearchQuery)
    .sort({ "lastMessage.timeCreated": -1 })
    .skip(searchOptions.page * searchOptions.limit)
    .limit(searchOptions.limit)
    .toArray();

  let profilePromise: Promise<IProfile[]> = Promise.resolve([]);
  if (searchOptions.includeProfiles && searchOptions.term) {
    profilePromise = searchProfiles(
      {
        term: searchOptions.term,
        limit: searchOptions.limit,
        page: searchOptions.page,
      },
      {
        fetcher: options.fetcher,
      }
    );
  }
  const [chats, profiles] = await Promise.all([chatPromise, profilePromise]);
  return {
    chats,
    profiles,
  };
}
