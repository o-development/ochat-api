import dotenv from "dotenv";
dotenv.config();

import { getProfileCollection, getChatCollection } from "../util/MongoClient";

async function run() {
  const profileCollection = await getProfileCollection();
  const chatCollection = await getChatCollection();
  try {
    await profileCollection.drop();
  } catch (err) {
    console.log(err);
  }
  try {
    await chatCollection.drop();
  } catch (err) {
    console.log(err);
  }
  console.log("dropped");
}
run();
