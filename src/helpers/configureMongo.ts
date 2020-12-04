import dotenv from "dotenv";
dotenv.config();

import { profileDb, chatDb } from "../util/MongoClient";

async function run() {
  await profileDb.createIndex({
    name: "text",
    searchable: 1,
    webId: 1,
  });
  console.log("profile index made");
  await chatDb.createIndex({
    name: "text",
    "participants.name": "text",
    "lastMessage.timeCreated": 1,
    "participants.webId": 1,
    "participants.isAdmin": 1,
    "lastMessage.maker": 1,
    isPublic: 1,
    type: 1,
    uri: 1,
  });
  console.log("chat index made");
}
run();

// EsClient.indices.create({
//   index: "profile",
//   body: {
//     mappings: {
//       properties: {
//         webId: { type: "keyword" },
//         name: { type: "search_as_you_type" },
//         image: { type: "text" },
//         searchable: { type: "boolean" },
//       },
//     },
//   },
// });
// EsClient.indices.create({
//   index: "chat",
//   body: {
//     mappings: {
//       properties: {
//         uri: { type: "keyword" },
//         name: { type: "search_as_you_type" },
//         type: { type: "text" },
//         images: { type: "keyword" },
//         "participants.name": { type: "search_as_you_type" },
//         "participants.webId": { type: "keyword" },
//         "participants.isAdmin": { type: "boolean" },
//         isPublic: { type: "boolean" },
//         "lastMessage.maker": { type: "keyword" },
//         "lastMessage.content": { type: "text" },
//         "lastMessage.timeCreated": { type: "date" },
//       },
//     },
//   },
// });
