import IHandler from "./IHandler";
import authenticationHandler from "./authentication.handler";
import profileHandler from "./profile.handler";
import chatHandler from "./chat.handler";
import messageHandler from "./message.handler";
import notificationSettingHandler from "./notificationSetting.handler";
import errorHandler from "./error.handler";

const handlers: IHandler[] = [
  authenticationHandler,
  profileHandler,
  chatHandler,
  messageHandler,
  notificationSettingHandler,
  errorHandler,
];

export default handlers;
