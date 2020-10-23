import ICronJob from "./ICronJob";
import cron from "node-cron";

const reIndexProfileCronJob: ICronJob = () => {
  cron.schedule("0 0 * * *", () => {
    // TODO
  });
};

export default reIndexProfileCronJob;
