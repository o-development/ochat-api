import MongoClient from "mongo-lazy-connect";

const endpoint = process.env.MONGO_ENDPOINT;

if (!endpoint) {
  throw Error("MONGO_ENDPOINT and MONGO_DB must be specified");
}

const mongoClient = MongoClient(endpoint, { useUnifiedTopology: true });
export const profileDb = mongoClient.collection("profile");
export const chatDb = mongoClient.collection("chat");

export default mongoClient;
