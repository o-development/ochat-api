import { Session } from "@inrupt/solid-auth-fetcher";
import IChat from "../chat/IChat";
import { getSessionByWebId } from "./AuthSessionManager";
import HttpError from "./HttpError";
import { ILoggedInAuthSession } from './getLoggedInAuthSession';

export default async function getAdministratorAuthSessionForChat(
  chat: IChat,
): Promise<ILoggedInAuthSession> {
  const administratorWebIds = chat.participants
    .filter((participant) => participant.isAdmin)
    .map((participant) => participant.webId);
  const validAuthSessions = (
    await Promise.all(
      administratorWebIds.map(async (webId) => {
        return await getSessionByWebId(webId);
      })
    )
  ).filter((session): boolean => session != undefined) as ILoggedInAuthSession[];
  if (validAuthSessions.length < 1) {
    throw new HttpError(`No valid auth session for ${chat.uri}`, 403, {
      chatUri: chat.uri,
      uri: chat.uri,
    });
  }
  return validAuthSessions[0]
}