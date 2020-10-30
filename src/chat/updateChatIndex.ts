import IChat from "./IChat";
import IFetcher from "../util/IFetcher";

export default function newChat(
  chatUri: string,
  chatData: Partial<IChat>,
  options: { fetcher?: IFetcher; webId: string }
): Promise<IChat> {
  // TODO
  throw new Error("not implemented");
}
