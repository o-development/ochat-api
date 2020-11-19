import IStartupJob from "./IStartupJob";
import streamAllChatIndexes from "../chat/streamAllChatIndexes";
import IChat from "../chat/IChat";
import externalChatHanderFactory from "../externalChat/externalChatHandlerFactory";
import { getSessionByWebId } from "../util/AuthSessionManager";
import { Session } from "@inrupt/solid-auth-fetcher";
import registerChatListeners from "../chat/registerChatListeners";

const runAllChatStartupTasks: IStartupJob = async () => {
  // Stream All Chats From ES
  await streamAllChatIndexes(async (chat: IChat) => {
    // Get a fetcher for an administrator
    const administratorWebIds = chat.participants
      .filter((participant) => participant.isAdmin)
      .map((participant) => participant.webId);
    const validAuthSessions = (
      await Promise.all(
        administratorWebIds.map(async (webId) => {
          return await getSessionByWebId(webId);
        })
      )
    ).filter((session): boolean => session != undefined) as Session[];
    const fetcher = validAuthSessions[0].fetch.bind(validAuthSessions[0]);
    // Get the ExternalChatHandler
    const externalChatHandler = await externalChatHanderFactory(
      chat.uri,
      chat.type,
      { fetcher }
    );
    // Run Startup Task
    // await externalChatHandler.runStartupTask();
    // Register Chat Listeners
    await registerChatListeners(chat.uri, {
      optionalExternalChatHandler: externalChatHandler,
      fetcher,
    });
  });
};

export default runAllChatStartupTasks;
