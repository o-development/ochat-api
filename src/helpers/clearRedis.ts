import RedisClient from "../util/RedisConnection";
import { getAuthKey, getAuthMapKey } from "../util/AuthSessionManager";
import { getLongChatKey } from "../externalChat/longChat/longChatCache";

/**
 * Helper Functions
 */
//key example "prefix*"
function deleteKeysByPattern(key: string): void {
  const stream = RedisClient.client.scanStream({
    // only returns keys following the pattern of "key"
    match: key,
    // returns approximately 100 elements per call
    count: 100,
  });

  stream.on("data", function (resultKeys: string[]) {
    if (resultKeys.length) {
      RedisClient.client.unlink(resultKeys);
    }
  });
  stream.on("end", function () {
    console.log("Deleted Keys");
  });
}

switch (process.argv[2]) {
  case "all":
    RedisClient.client.flushdb(function (err, succeeded) {
      console.log(succeeded); // will be true if successfull
    });
    break;
  case "auth":
    deleteKeysByPattern(getAuthKey(""));
    deleteKeysByPattern(getAuthMapKey(""));
    break;
  case "longChat":
    deleteKeysByPattern(getLongChatKey(""));
    break;
  default:
    throw new Error("Must provide a clear type.");
}
