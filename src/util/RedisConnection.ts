import redis from "redis";
import { promisify } from "util";

const password = process.env.REDIS_PASSWORD;
const port = parseInt(process.env.REDIS_PORT as string);
const host = process.env.REDIS_HOST;

const redisClient = redis.createClient({
  password,
  port,
  host,
});

redisClient.on("error", (error) => {
  console.error("Redis Error: ", error);
});

const redisConnection = {
  get: promisify(redisClient.get).bind(redisClient),
  set: promisify(redisClient.set).bind(redisClient),
  del: promisify(redisClient.del).bind(redisClient) as (
    key: string
  ) => Promise<number>,
  client: redisClient,
};

export default redisConnection;
