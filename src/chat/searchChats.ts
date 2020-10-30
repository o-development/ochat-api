import Chat from "./IChat";
import IFetcher from "../util/IFetcher";

export default async function searchChats(
  searchOptions: {
    includeProfiles?: boolean;
    page: number;
    limit: number;
    term: string;
  },
  options: { fetcher?: IFetcher; webId: string }
): Promise<Chat[]> {
  throw new Error("meh");
}
