import { IChatParticipant } from "../../chat/IChat";
import IFetcher from "../../util/IFetcher";
import { Access } from "@inrupt/solid-client";
import { setAcl } from "../../util/aclUtils";

export default async function saveExternalChatParticipants(
  chatUri: string,
  participants: IChatParticipant[],
  options: {
    fetcher?: IFetcher;
    isAdmin: Access;
    hasAccess: Access;
    isPublic: boolean;
  }
): Promise<void> {
  const accessMap: Record<string, Access> = {};
  participants.forEach((participant) => {
    accessMap[participant.webId] = participant.isAdmin
      ? options.isAdmin
      : options.hasAccess;
  });
  if (options.isPublic) {
    accessMap["public"] = options.hasAccess;
  }
  await setAcl(chatUri, accessMap, options.fetcher);
}
