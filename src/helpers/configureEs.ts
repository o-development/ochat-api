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
      },
    },
  },
});
