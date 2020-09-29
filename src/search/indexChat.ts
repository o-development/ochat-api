import { Client } from "@elastic/elasticsearch";
import Chat from "./Chat";

export default async function searchChats(
  client: Client,
  chatUrl: string
): Promise<Chat[]> {
  throw new Error("meh");
}
