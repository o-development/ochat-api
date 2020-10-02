import express from "express";
// import indexChatHandler from "./handlers/indexChat.handler";
import authenticationHandler from "./handlers/authentication.handler";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 9000;

const app = express();

authenticationHandler(app);

app.listen(PORT, () => console.log(`Listening on ${PORT}`));

// app.get("/chat/index", indexChatHandler);
