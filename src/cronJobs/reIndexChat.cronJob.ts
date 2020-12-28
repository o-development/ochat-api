import ICronJob from "./ICronJob";
import cron from "node-cron";
// import getAllChatIndexIndexes from "../chat/getAllChatIndexes";

const reIndexChatCronJob: ICronJob = () => {
  cron.schedule("0 0 * * *", async () => {
    // const ids = await getAllChatIndexIds();
    // for (let i = 0; i < ids.length; i++) {
    //   // const fetchedChat = fetchExternalChat()
    // }
  });
};

export default reIndexChatCronJob;
