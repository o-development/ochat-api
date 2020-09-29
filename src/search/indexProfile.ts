import { Client } from "@elastic/elasticsearch";
import Profile from "./Profile";

export default async function searchChats(
  client: Client,
  profileUrl: string
): Promise<Profile[]> {
  throw new Error("meh");
}
