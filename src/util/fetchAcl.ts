import { AnyPointer } from "clownface";
import IFetcher from "../util/IFetcher";
import nodeFetch from "node-fetch";
import HttpError from "./HttpError";
import parseLinkHeader from "parse-link-header";
import { fetchClownfaceDataset } from "./fetchClownFace";
import Clownface from "clownface/lib/Clownface";

export default async function fetchAcl(
  url: string,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  fetcher?: IFetcher = nodeFetch
): Promise<Clownface> {
  const parsedUrl = new URL(url);
  const curPathname = parsedUrl.pathname.split("/");
  while (curPathname.length > 0) {
    try {
      const optionsResult = await fetcher(
        `${parsedUrl.origin}${curPathname.join("/")}`
      );
      const linkHeader = optionsResult.headers.get("link");
      if (linkHeader) {
        const parsedLinkHeader = parseLinkHeader(linkHeader);
        const aclRelativeLocation = parsedLinkHeader?.acl.url;
        if (aclRelativeLocation) {
          const aclLocation = `${parsedUrl.origin}${curPathname
            .slice(0, curPathname.length - 1)
            .join("/")}/${aclRelativeLocation}`;
          return await fetchClownfaceDataset(aclLocation, fetcher);
        }
      }
    } catch (err) {
      if (err.status === 403 || err.status === 401) {
        throw new HttpError(
          `You are not authorized to access this document's access control rules.`,
          403
        );
      } else if (err.status === 404) {
        // Do nothing
      }
      console.log(err);
    }
    curPathname.pop();
  }
  throw new Error("Done");
}
