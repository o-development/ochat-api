import { Client } from "@elastic/elasticsearch";
import Chat from "./Chat";

export default async function searchChats(
  client: Client,
  options: {
    includeProfiles?: boolean;
    page: number;
    limit: number;
    term: string;
  }
): Promise<Chat[]> {
  throw new Error("meh");
}
