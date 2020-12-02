import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import handlers from "./httpHandlers/httpHandlers";
import cronJobs from "./cronJobs/cronJobs";
import startupJobs from "./startupJobs/startupJobs";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import socketHandler from "./socketHanders/socketHandler";

const env = process.env.ENV;
const clientOrigin = process.env.CLIENT_ORIGIN;

async function run() {
  const PORT = process.env.PORT || 9000;

  const app = express();
  const httpServer = createServer(app);

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

  if (true || env !== "dev") {
    console.log("Running startup jobs");
    await Promise.all(startupJobs.map((startupJob) => startupJob()));
  }

  socketHandler(httpServer);

  httpServer.listen(PORT, () => console.log(`Listening on ${PORT}`));
}
run();
