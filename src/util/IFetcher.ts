import nodeFetch from "node-fetch";

type IFetcher = (
  requestInfo: RequestInfo,
  requestInit?: RequestInit
) => Promise<Response>;

export default IFetcher;

export function guaranteeFetcher(fetcher?: IFetcher): IFetcher {
  if (!fetcher) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return nodeFetch;
  }
  return fetcher;
}
