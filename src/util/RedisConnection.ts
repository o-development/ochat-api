import Redis from "ioredis";

const password = process.env.REDIS_PASSWORD;
const port = parseInt(process.env.REDIS_PORT as string);
const host = process.env.REDIS_HOST;

const redisClient = new Redis({
  password,
  port,
  host,
});

redisClient.on("error", (error) => {
  console.error("Redis Error: ", error);
});

export default redisClient;
