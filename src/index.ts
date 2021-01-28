import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import handlers from "./httpHandlers/httpHandlers";
import cronJobs from "./cronJobs/cronJobs";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import socketHandler from "./socketHanders/socketHandler";
import mongoClient from "./util/MongoClient";

const clientOrigin = process.env.CLIENT_ORIGIN;

async function run() {
  const PORT = process.env.PORT || 9000;

  await mongoClient.connect();

  const app = express();
  const httpServer = createServer(app);

  app.enable("trust proxy");
  app.use(
    cors({
      origin: clientOrigin,
      credentials: true,
    })
  );
  app.use(bodyParser.json());
  app.use(cookieParser());

  app.get("/", (req, res) => {
    res.send("API Online.");
  });

  handlers.forEach((handler) => handler(app));

  cronJobs.forEach((cronJob) => cronJob());

  console.info("Running startup jobs");
  // await Promise.all(startupJobs.map((startupJob) => startupJob()));

  socketHandler(httpServer);

  httpServer.listen(PORT, () => console.info(`Listening on ${PORT}`));
}
run();
