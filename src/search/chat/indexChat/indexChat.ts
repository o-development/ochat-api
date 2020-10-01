import Chat from "../Chat";
import fetchExternalChat from "./fetchExternalChat";
import esClient from "../../../util/esClient";

/**
 * Fetches a chat and saves it to the database
 * @param chatUrl The url of the chat that should be fetched
 */
export default async function indexChat(chatUrl: string): Promise<Chat> {
  const chat: Chat = await fetchExternalChat(chatUrl);
  esClient.create({
    index: "chat",
    id: chatUrl,
    body: chat,
  });
  return chat;
}
