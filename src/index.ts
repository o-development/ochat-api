import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import handlers from "./handlers/handlers";
import cronJobs from "./cronJobs/cronJobs";

const PORT = process.env.PORT || 9000;

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("API Online.");
});

handlers.forEach((handler) => handler(app));

cronJobs.forEach((cronJob) => cronJob());

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
