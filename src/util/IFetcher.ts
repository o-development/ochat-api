type IFetcher = (
  requestInfo: RequestInfo,
  requestInit?: RequestInit
) => Promise<Response>;

export default IFetcher;
