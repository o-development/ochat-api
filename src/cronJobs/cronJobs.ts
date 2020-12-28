import ICronJob from "./ICronJob";
import reIndexChatCronJob from "./reIndexChat.cronJob";
import reIndexProfileCronJob from "./reIndexProfile.cronJob";

const cronJobs: ICronJob[] = [reIndexChatCronJob, reIndexProfileCronJob];

export default cronJobs;
