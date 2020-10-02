import redis from "redis";

const password = process.env.REDIS_PASSWORD;
const port = parseInt(process.env.REDIS_PORT as string);
const host = process.env.REDIS_HOST;

export const redisClient = redis.createClient({
  password,
  port,
  host,
});

redisClient.on("error", (error) => {
  console.error(error);
});
