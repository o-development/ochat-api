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

// // See all fields: https://documentation.onesignal.com/reference/create-notification
// const notification = {
//   contents: {
//     tr: "Yeni bildirim",
//     en: "New notification",
//   },
//   included_segments: ["Subscribed Users"],
// };

// // using async/await
// try {
//   const response = await oneSignalClient.createNotification(notification);
//   console.log(response);
//   console.log(response.body.id);
// } catch (e) {
//   console.log(1.5);
//   console.log(e.message);
//   if (e instanceof OneSignalHTTPError) {
//     // When status code of HTTP response is not 2xx, HTTPError is thrown.
//     console.log(2);
//     console.log(e.statusCode);
//     console.log(e.body);
//   }
// }

// res.send("Cool stuff");
