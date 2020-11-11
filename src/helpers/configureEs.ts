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
        participants: {
          type: "nested",
          properties: {
            name: { type: "search_as_you_type" },
            webId: { type: "keyword" },
            isAdmin: { type: "boolean" },
          },
        },
        isPublic: { type: "boolean" },
        lastMessage: {
          type: "nested",
          properties: {
            maker: { type: "keyword" },
            content: { type: "text" },
            timeCreated: { type: "text" },
          },
        },
      },
    },
  },
});
