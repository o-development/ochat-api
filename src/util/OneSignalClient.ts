import * as OneSignal from "onesignal-node";

const oneSignalAppId = process.env.ONE_SIGNAL_APP_ID;
const oneSignalRestApiKey = process.env.ONE_SIGNAL_REST_API_KEY;

if (!oneSignalAppId || !oneSignalRestApiKey) {
  throw new Error(
    "Both ONE_SIGNAL_APP_ID and ONE_SIGNAL_REST_API_KEY must be defined as environment variables."
  );
}

const oneSignalClient = new OneSignal.Client(
  oneSignalAppId,
  oneSignalRestApiKey
);

export default oneSignalClient;
