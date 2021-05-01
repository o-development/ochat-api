import IHttpHandler from "./IHttpHandler";
import authenticationHandler from "./authentication.httpHandler";
import profileHandler from "./profile.httpHandler";
import chatHandler from "./chat.httpHandler";
import messageHandler from "./message.httpHandler";
import notificationSettingHandler from "./notificationSetting.httpHandler";
import errorHandler from "./error.httpHandler";
import fileUpload from "./fileUpload.httpHandler";

const handlers: IHttpHandler[] = [
  authenticationHandler,
  profileHandler,
  chatHandler,
  messageHandler,
  notificationSettingHandler,
  fileUpload,
  errorHandler,
];

export default handlers;
