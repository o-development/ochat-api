import dotenv from "dotenv";
dotenv.config();

import EsClient from "../util/EsClient";

EsClient.indices.delete({ index: "chat" });
EsClient.indices.delete({ index: "profile" });
