import { createClient } from "redis";

let redisClient: ReturnType<typeof createClient>;

declare global {
  var _redisClient: typeof redisClient | undefined;
}

if (!global._redisClient) {
  global._redisClient = createClient({
    url: "redis://localhost:6379",
  });

  global._redisClient.on("error", (err) =>
    console.error("Redis Error:", err)
  );

  global._redisClient.connect();
}

redisClient = global._redisClient;

export default redisClient;