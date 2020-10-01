import express from "express";
import indexChatHandler from "./handlers/indexChat.handler";

const app = express();

app.get("/chat/index", indexChatHandler);
