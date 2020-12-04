import dotenv from "dotenv";
dotenv.config();

import { profileDb, chatDb } from "../util/MongoClient";

async function run() {
  try {
    await profileDb.drop();
  } catch (err) {
    console.log(err);
  }
  try {
    await chatDb.drop();
  } catch (err) {
    console.log(err);
  }
  console.log("dropped");
}
run();
