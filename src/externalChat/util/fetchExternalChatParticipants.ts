import fetchAcl from "../../util/fetchAcl";
import getContainerUri from "./getContainerUri";
import { IChatParticipant } from "../../chat/IChat";
import IFetcher from "../../util/IFetcher";
import { Access } from "@inrupt/solid-client";
import fetchExternalProfile from "../../profile/externalProfile/fetchExternalProfile";

export default async function fetchExternalChatParticipants(
  chatUri: string,
  options: {
    fetcher?: IFetcher;
    isAdmin: (agentAccess: Access) => boolean;
    hasAccess: (agentAccess: Access) => boolean;
  }
): Promise<{ isPublic: boolean; participants: IChatParticipant[] }> {
  const agentAccess = await fetchAcl(getContainerUri(chatUri), options.fetcher);
  const isPublic = options.hasAccess(agentAccess.public);

  const webIdsWithAccess = Object.keys(agentAccess)
    .filter((key) => key !== "public")
    .filter((webId) => options.hasAccess(agentAccess[webId]));
  const participants: IChatParticipant[] = [];
  await Promise.all(
    webIdsWithAccess.map(async (webId) => {
      participants?.push({
        webId,
        isAdmin: options.isAdmin(agentAccess[webId]),
        name:
          (await fetchExternalProfile(webId, { fetcher: options.fetcher }))
            .name || "",
      });
    })
  );
  return {
    isPublic,
    participants,
  };
}
