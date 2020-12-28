import { MongoClient, Collection } from "mongodb";
import IChat from "src/chat/IChat";
import IProfile from "src/profile/IProfile";

const endpoint = process.env.MONGO_ENDPOINT;
const db = process.env.MONGO_DB;

if (!endpoint || !db) {
  throw Error("MONGO_ENDPOINT and MONGO_DB must be specified");
}

const mongoClient = new MongoClient(endpoint, { useUnifiedTopology: true });

export default mongoClient;

const connectionPromise = mongoClient.connect();

export async function getProfileCollection(): Promise<Collection<IProfile>> {
  await connectionPromise;
  const mongoDb = mongoClient.db(db);
  return mongoDb.collection<IProfile>("profile");
}

export async function getChatCollection(): Promise<Collection<IChat>> {
  await connectionPromise;
  const mongoDb = mongoClient.db(db);
  return mongoDb.collection<IChat>("chat");
}
