import Chat from "../Chat";
import fetchCf from "../../../util/fetchCf";
import fetchChatParticipants from "./fetchChatParticipants";

const TITLE = "http://purl.org/dc/elements/1.1/title";
const IMAGE = "http://xmlns.com/foaf/0.1/img";

export default async function fetchExternalChat(
  chatUrl: string
): Promise<Chat> {
  // TODO: handle long chat
  const [chatData, [isPublic, participants]] = await Promise.all([
    fetchCf(chatUrl).then((dataset) => dataset.node(chatUrl)),
    fetchChatParticipants(chatUrl),
  ]);
  const chat: Chat = {
    uri: chatUrl,
    name: chatData.out(TITLE).value,
    images: chatData.out(IMAGE).values,
    participants,
    isPublic,
  };
  return chat;
}
