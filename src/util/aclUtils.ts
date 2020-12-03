import IFetcher, { guaranteeFetcher } from "../util/IFetcher";
import {
  getSolidDatasetWithAcl,
  getAgentAccessAll,
  Access,
  getPublicAccess,
  hasResourceAcl,
  hasAccessibleAcl,
  createAcl,
  getResourceAcl,
  setAgentDefaultAccess,
  saveAclFor,
  setPublicResourceAccess,
  setAgentResourceAccess,
  setPublicDefaultAccess,
} from "@inrupt/solid-client";
import HttpError from "./HttpError";

export async function fetchAcl(
  url: string,
  possibleFetcher?: IFetcher
): Promise<Record<string, Access>> {
  const fetcher = guaranteeFetcher(possibleFetcher);
  const chatWithAcl = await getSolidDatasetWithAcl(url, { fetch: fetcher });
  const accessByAgent = getAgentAccessAll(chatWithAcl);
  const publicAccess = getPublicAccess(chatWithAcl);
  if (!accessByAgent) {
    throw new HttpError(`Not allowed to access acl for ${url}`, 403);
  }
  if (publicAccess) {
    accessByAgent["public"] = publicAccess;
  }
  return accessByAgent;
}

export async function setAcl(
  url: string,
  webIdAccess: Record<string, Access>,
  possibleFetcher?: IFetcher
): Promise<void> {
  console.log("Set ACL");
  console.log(webIdAccess);
  console.log(url);

  const fetcher = guaranteeFetcher(possibleFetcher);
  // Fetch the SolidDataset and its associated ACLs, if available:
  const myDatasetWithAcl = await getSolidDatasetWithAcl(url, {
    fetch: fetcher,
  });

  // Obtain the SolidDataset's own ACL, if available,
  // or initialise a new one, if possible:
  if (
    !hasResourceAcl(myDatasetWithAcl) &&
    !hasAccessibleAcl(myDatasetWithAcl)
  ) {
    throw new HttpError(
      "The current user does not have permission to change access rights to this Resource.",
      403
    );
  }

  let resourceAcl = createAcl(myDatasetWithAcl);
  // Give someone Control access to the given Resource:
  Object.entries(webIdAccess).forEach(([webId, access]) => {
    if (webId === "public") {
      resourceAcl = setPublicDefaultAccess(resourceAcl, access);
      resourceAcl = setPublicResourceAccess(resourceAcl, access);
    } else {
      resourceAcl = setAgentDefaultAccess(resourceAcl, webId, access);
      resourceAcl = setAgentResourceAccess(resourceAcl, webId, access);
    }
  });

  // Now save the ACL:
  await saveAclFor(myDatasetWithAcl, resourceAcl, {
    fetch: (info, init) => {
      console.log(info, init);
      return fetcher(info, init);
    },
  });
}
