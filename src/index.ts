import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import authenticationHandler from "./handlers/authentication.handler";
import indexAuthorizedProfile from "./handlers/indexAuthorizedProfile.handler";
import extractAuth from "./middleware/extractAuth";
import handleError from "./middleware/handleError";

const PORT = process.env.PORT || 9000;

const app = express();
app.use(cors());

authenticationHandler(app);

app.use(extractAuth);

app.get("/", (req, res) => {
  res.send("API Online.");
});

app.post("/profile/index", indexAuthorizedProfile);

app.use(handleError);

app.listen(PORT, () => console.log(`Listening on ${PORT}`));

// app.get("/chat/index", indexChatHandler);
