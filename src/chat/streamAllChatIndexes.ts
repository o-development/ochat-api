import EsClient from "../util/EsClient";
import IChat, { toIChat } from "../chat/IChat";

export default async function streamAllChatIndexes(
  onResult: (chat: IChat) => Promise<void>,
  options?: {
    ignoreError?: boolean;
  }
): Promise<void> {
  return new Promise((resolve, reject) => {
    let doneGettingChats = false;
    let currentlyProcessing = 0;
    let chatsRetrieved = 0;
    let globalError = false;

    // first we do a search, and specify a scroll timeout
    EsClient.search(
      {
        index: "chat",
        scroll: "1s",
        body: {
          query: {
            match_all: {},
          },
        },
      },
      async function getMoreUntilDone(error, response) {
        if (globalError) {
          return;
        }
        if (error && !options?.ignoreError) {
          reject(error);
          globalError = true;
          return;
        }

        chatsRetrieved += response.body.hits.hits.length;
        if (response.body.hits.total.value !== chatsRetrieved) {
          // now we can call scroll over and over
          EsClient.scroll(
            {
              scroll_id: response.body._scroll_id,
              scroll: "1s",
            },
            getMoreUntilDone
          );
        } else {
          doneGettingChats = true;
        }

        if (error) {
          return;
        }

        // collect all the records
        Promise.all(
          response.body.hits.hits.map(async (hit: { _source: unknown }) => {
            currentlyProcessing++;
            try {
              const chat = toIChat(hit._source);
              await onResult(chat);
              currentlyProcessing--;
            } catch (err) {
              if (!options?.ignoreError) {
                reject(err);
                globalError = true;
                return;
              }
              currentlyProcessing--;
            }
            if (doneGettingChats && currentlyProcessing === 0) {
              resolve();
            }
          })
        );
      }
    );
  });
}
