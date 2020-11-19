import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import handlers from "./handlers/handlers";
import cronJobs from "./cronJobs/cronJobs";
import startupJobs from "./startupJobs/startupJobs";
import bodyParser from "body-parser";

async function run() {
  const PORT = process.env.PORT || 9000;

  const app = express();
  app.use(cors());
  app.use(bodyParser.json());

  app.get("/", (req, res) => {
    res.send("API Online.");
  });

  handlers.forEach((handler) => handler(app));

  cronJobs.forEach((cronJob) => cronJob());

  console.log("Running startup jobs");
  await Promise.all(startupJobs.map((startupJob) => startupJob()));

  app.listen(PORT, () => console.log(`Listening on ${PORT}`));
}
run();
