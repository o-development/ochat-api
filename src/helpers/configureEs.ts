import dotenv from "dotenv";
dotenv.config();

import EsClient from "../util/EsClient";

EsClient.indices.create({
  index: "profile",
  body: {
    mappings: {
      properties: {
        webId: { type: "keyword" },
        name: { type: "search_as_you_type" },
        image: { type: "text" },
        searchable: { type: "boolean" },
      },
    },
  },
});
EsClient.indices.create({
  index: "chat",
  body: {
    mappings: {
      properties: {
        uri: { type: "keyword" },
        name: { type: "search_as_you_type" },
        type: { type: "text" },
        images: { type: "keyword" },
        "participants.name": { type: "search_as_you_type" },
        "participants.webId": { type: "keyword" },
        "participants.isAdmin": { type: "boolean" },
        isPublic: { type: "boolean" },
        "lastMessage.maker": { type: "keyword" },
        "lastMessage.content": { type: "text" },
        "lastMessage.timeCreated": { type: "date" },
      },
    },
  },
});
