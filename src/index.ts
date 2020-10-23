import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import handlers from "./handlers/handlers";

const PORT = process.env.PORT || 9000;

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("API Online.");
});

handlers.forEach((handler) => handler(app));

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
