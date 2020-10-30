import IChat from "./IChat";
import IFetcher from "../util/IFetcher";

export default function newChatIndex(
  chatUrl: string,
  options: { fetcher?: IFetcher; webId: string }
): Promise<IChat> {
  // TODO
  throw new Error("not implemented");
}
