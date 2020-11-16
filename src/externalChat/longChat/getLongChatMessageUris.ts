import fetchClownface from "../../util/fetchClownFace";
import { basicContainer, container, contains, rdfType } from "../../util/nodes";

async function getContainedUrisFromContainer(
  containerUri: string
): Promise<string[]> {
  const containerNode = await fetchClownface(
    containerUri,
    [basicContainer, container],
    this.fetcher
  );
  const containedNodes = containerNode
    .out(contains)
    .has(rdfType, [container, basicContainer])
    .values.sort()
    .reverse();
  return containedNodes;
}

/**
 * Get a list of uris that point to long chat messages
 * @param minUris The minimum number of URIs that should be found. The
 * algorithm might return more. If it returns fewer, that means no more
 * uris exist than the ones provided.
 * @param previousPageId If the previousPageId is provided, the algorithm
 * will only return uris after that page.
 */
export default async function getLongChatMessageUris(
  chatUri: string,
  minUris: number,
  previousPageId?: string
): Promise<string[]> {
  // Get PageId year month and day
  let pageIdYear: string | undefined;
  let pageIdMonth: string | undefined;
  let pageIdDay: string | undefined;
  const rootContainer = getContainerUri(chatUri);
  if (previousPageId) {
    pageIdDay = getContainerUri(previousPageId);
    pageIdMonth = getContainerUri(pageIdDay);
    pageIdYear = getContainerUri(pageIdMonth);
  }

  let pageUris: string[] = [];
  const yearNodes = await getContainedUrisFromContainer(rootContainer);
  let completedFirstYearIteration = false;
  for (
    let y = pageIdYear ? yearNodes.indexOf(pageIdYear) : 0;
    y < yearNodes.length;
    y++
  ) {
    const monthNodes = await getContainedUrisFromContainer(yearNodes[y]);
    for (
      let m =
        !completedFirstYearIteration && pageIdMonth
          ? monthNodes.indexOf(pageIdMonth)
          : 0;
      m < monthNodes.length;
      m++
    ) {
      const dayNodes = await getContainedUrisFromContainer(monthNodes[m]);
      pageUris = pageUris.concat(
        dayNodes.map((dayNode) => `${dayNode}chat.ttl#this`)
      );
      if (dayNodes.length >= minUris) {
        return pageUris;
      }
    }
    completedFirstYearIteration = true;
  }
  return pageUris;
}
