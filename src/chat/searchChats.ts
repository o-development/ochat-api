import Chat, { toIChat } from "./IChat";
import IFetcher from "../util/IFetcher";
import EsClient from "../util/EsClient";
import { RequestParams } from "@elastic/elasticsearch";

export default async function searchChats(
  searchOptions: {
    includeProfiles?: boolean;
    page: number;
    limit: number;
    term?: string;
  },
  options: { fetcher?: IFetcher; webId: string }
): Promise<Chat[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const searchBody: RequestParams.Search<Record<string, any>> = {
    index: "chat",
    from: searchOptions.page,
    size: searchOptions.limit,
    body: {
      sort: [
        "_score",
        {
          "lastMessage.timeCreated": "desc",
        },
      ],
      query: {
        bool: {
          should: [
            {
              term: {
                "participants.webId": {
                  value: options.webId,
                  boost: 2.0,
                },
              },
            },
            {
              term: {
                isPublic: true,
              },
            },
          ],
          minimum_should_match: 1,
        },
      },
    },
  };
  if (searchOptions.term && searchBody.body) {
    searchBody.body.query.bool.must = {
      multi_match: {
        query: searchOptions.term,
        type: "phrase_prefix",
        fields: [
          "name",
          "name._2gram",
          "name._3gram",
          "participants.name",
          "participants.name._2gram",
          "participatns.name._3gram",
        ],
      },
    };
  }

  const result = await EsClient.search(searchBody);
  return result.body.hits.hits.map((hit: { _source: unknown }) => {
    return toIChat(hit._source);
  });
}
