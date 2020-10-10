type fetcherType = (
  requestInfo: RequestInfo,
  requestInit?: RequestInit
) => Promise<Response>;

export default fetcherType;
