import getChatIndex from "./getChatIndex";
import { retrieveProfileIndex } from "../profile/profileIndexApi";
import getAdministratorAuthSessionForChat from "../util/getAdministratorAuthSessionForChat";
import updateChatIndex from "./updateChatIndex";

export default async function addParticipantToPublicChat(
  chatUri: string,
  webId: string
) {
  const chat = await getChatIndex(chatUri, { webId: webId });
  // If the chat is public and the user is not a participant, add them
  if (!chat.participants.some((p) => p.webId === webId) && chat.isPublic) {
    const userProfile = await retrieveProfileIndex(webId);
    const adminAuthSession = await getAdministratorAuthSessionForChat(chat);
    await updateChatIndex(
      chatUri,
      {
        participants: [
          ...chat.participants,
          {
            name: userProfile.name,
            webId: webId,
            image: userProfile.image,
            isAdmin: false,
          },
        ],
      },
      {
        webId: adminAuthSession.info.webId,
        fetcher: adminAuthSession.fetch.bind(adminAuthSession),
      }
    );
  }
}
