import Chat from "../IChat";
import fetchClownFace from "../../util/fetchClownFace";
import fetchChatParticipants from "./fetchExternalChatParticipants";
import IFetcher from "../../util/IFetcher";
import { title, foafImage } from "../../util/nodes";

export default async function fetchExternalChat(
  chatUrl: string,
  options: { fetcher?: IFetcher }
): Promise<Chat> {
  // TODO: handle long chat
  const [chatData, [isPublic, participants]] = await Promise.all([
    fetchClownFace(chatUrl, options.fetcher).then((dataset) =>
      dataset.node(chatUrl)
    ),
    fetchChatParticipants(chatUrl),
  ]);

  const chat: Chat = {
    uri: chatUrl,
    name: chatData.out(title).value || "",
    images: chatData.out(foafImage).values,
    participants,
    isPublic,
    lastMessaged: new Date(),
    lastMessage: "cool dude",
  };
  return chat;
}
