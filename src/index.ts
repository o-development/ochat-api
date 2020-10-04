import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import authenticationHandler from "./handlers/authentication.handler";
import indexProfileHandler from "./handlers/indexProfile.handler";

const PORT = process.env.PORT || 9000;

const app = express();
app.use(cors());

authenticationHandler(app);

app.get("/", (req, res) => {
  res.send("API Online.");
})

app.get("/profile/index", indexProfileHandler);

app.listen(PORT, () => console.log(`Listening on ${PORT}`));

// app.get("/chat/index", indexChatHandler);
