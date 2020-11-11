import IFetcher from "../util/IFetcher";
import nodeFetch from "node-fetch";
import {
  getSolidDatasetWithAcl,
  getAgentAccessAll,
  Access,
  getPublicAccess,
} from "@inrupt/solid-client";
import HttpError from "./HttpError";

export default async function fetchAcl(
  url: string,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  fetcher?: IFetcher = nodeFetch
): Promise<Record<string, Access>> {
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
