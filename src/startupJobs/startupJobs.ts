import IStartupJob from "./IStartupJob";
import runAllChatStartupTasks from "./runAllChatStartupTasks.startupJob";

const startupJobs: IStartupJob[] = [runAllChatStartupTasks];

export default startupJobs;
