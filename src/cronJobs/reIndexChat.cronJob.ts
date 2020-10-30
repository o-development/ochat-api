import ICronJob from "./ICronJob";
import cron from "node-cron";
import getAllChatIndexIds from "../chat/getAllChatIndexIds";
import fetchExternalChat from "../chat/externalChat/fetchExternalChat";

const reIndexChatCronJob: ICronJob = () => {
  cron.schedule("0 0 * * *", async () => {
    const ids = await getAllChatIndexIds();
    for (let i = 0; i < ids.length; i++) {
      // const fetchedChat = fetchExternalChat()
    }
  });
};

export default reIndexChatCronJob;
