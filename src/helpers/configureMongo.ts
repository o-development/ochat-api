import dotenv from "dotenv";
dotenv.config();

import { getChatCollection, getProfileCollection } from "../util/MongoClient";

async function run() {
  const profileCollection = await getProfileCollection();
  const chatCollection = await getChatCollection();
  await profileCollection.createIndex({
    "$**": "text",
  });
  await profileCollection.createIndex(
    {
      webId: 1,
    },
    { unique: true }
  );
  await chatCollection.createIndex({
    "$**": "text",
  });
  await chatCollection.createIndex(
    {
      uri: 1,
    },
    { unique: true }
  );
}
run();
