import IFetcher from "../../util/IFetcher";
import { fetchClownfaceNode } from "../../util/clownFaceUtils";
import { basicContainer, container, contains, rdfType } from "../../util/nodes";
import getContainerUri from "../util/getContainerUri";
import HttpError from "../../util/HttpError";

async function getContainedUrisFromContainer(
  containerUri: string,
  fetcher?: IFetcher
): Promise<string[]> {
  const containerNode = await fetchClownfaceNode(
    containerUri,
    [basicContainer, container],
    fetcher
  );
  const containedNodes = containerNode
    .out(contains)
    .has(rdfType, [container, basicContainer])
    .values.sort()
    .reverse();
  return [...new Set(containedNodes)];
}

/**
 * Get a list of uris all chat URIs that happened after the "mostRecentPage"
 * @param mostRecentPageId If the mostRecentPageId is present, URIs up to that
 * page will be returned. If not, all uris will be returned
 */
export default async function catchUpLongChatMessageUris(
  chatUri: string,
  mostRecentPageId?: string,
  options?: { fetcher?: IFetcher }
): Promise<string[]> {
  // Get PageId year month and day
  let pageIdYear: string | undefined;
  let pageIdMonth: string | undefined;
  let pageIdDay: string | undefined;
  const rootContainer = getContainerUri(chatUri);
  if (mostRecentPageId) {
    pageIdDay = getContainerUri(mostRecentPageId);
    pageIdMonth = getContainerUri(pageIdDay);
    pageIdYear = getContainerUri(pageIdMonth);
  }

  const pageUris: string[] = [];
  const yearNodes = await getContainedUrisFromContainer(
    rootContainer,
    options?.fetcher
  );
  if (pageIdYear && !yearNodes.includes(pageIdYear)) {
    throw new HttpError(`Could not find year ${pageIdYear} in pod.`, 400);
  }
  await Promise.all(
    yearNodes
      .filter((yearNode) => !pageIdYear || yearNode >= pageIdYear)
      .map(async (yearNode) => {
        const monthNodes = await getContainedUrisFromContainer(
          yearNode,
          options?.fetcher
        );
        if (
          pageIdMonth &&
          yearNode === pageIdYear &&
          !monthNodes.includes(pageIdMonth)
        ) {
          throw new HttpError(
            `Could not find month ${pageIdMonth} in pod.`,
            400
          );
        }
        await Promise.all(
          monthNodes
            .filter(
              (monthNode) =>
                !pageIdMonth ||
                yearNode !== pageIdYear ||
                monthNode >= pageIdMonth
            )
            .map(async (monthNode) => {
              const dayNodes = await getContainedUrisFromContainer(
                monthNode,
                options?.fetcher
              );
              if (
                pageIdDay &&
                monthNode === pageIdMonth &&
                !dayNodes.includes(pageIdDay)
              ) {
                throw new HttpError(
                  `Could not find day ${pageIdDay} in pod.`,
                  400
                );
              }
              dayNodes
                .filter(
                  (dayNode) =>
                    !pageIdDay ||
                    monthNode !== pageIdMonth ||
                    dayNode > pageIdDay
                )
                .forEach((dayNode) => pageUris.push(`${dayNode}chat.ttl`));
            })
        );
      })
  );
  return pageUris.sort().reverse();
}
