import { getChatCollection } from "../util/MongoClient";

export default async function streamAllChatIndexes(
  onResult: (chat: unknown) => Promise<void>,
  options?: {
    ignoreError?: boolean;
  }
): Promise<void> {
  const chatCollection = await getChatCollection();
  return new Promise((resolve, reject) => {
    let doneGettingChats = false;
    let currentlyProcessing = 0;
    const stream = chatCollection.find().stream();
    stream.on("data", async (data: unknown) => {
      currentlyProcessing++;
      try {
        await onResult(data);
        currentlyProcessing--;
      } catch (err) {
        if (!options?.ignoreError) {
          reject(err);
          stream.close();
          return;
        }
      }
      if (doneGettingChats && currentlyProcessing === 0) {
        resolve();
      }
    });
    stream.on("error", (err) => {
      if (!options?.ignoreError) {
        reject(err);
        stream.close();
        return;
      }
    });
    stream.on("close", () => {
      doneGettingChats = true;
      if (currentlyProcessing === 0) {
        resolve();
      }
    });
  });
}
