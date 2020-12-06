import IStartupJob from "./IStartupJob";
import streamAllChatIndexes from "../chat/streamAllChatIndexes";
import { toIChat } from "../chat/IChat";
import externalChatHanderFactory from "../externalChat/externalChatHandlerFactory";
import { getSessionByWebId } from "../util/AuthSessionManager";
import { Session } from "@inrupt/solid-auth-fetcher";
import registerChatListeners from "../chat/registerChatListeners";
import HttpError from "../util/HttpError";
import { getChatCollection } from "../util/MongoClient";

const runAllChatStartupTasks: IStartupJob = async () => {
  if (process.env.ENV === "dev") {
    return;
  }

  const chatCollection = await getChatCollection();
  // Stream All Chats From ES
  await streamAllChatIndexes(async (possibleChat: unknown) => {
    try {
      const chat = toIChat(possibleChat);
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
      if (validAuthSessions.length < 1) {
        throw new HttpError(`No valid auth session for ${chat.uri}`, 403, {
          chatUri: chat.uri,
          uri: chat.uri,
        });
      }
      const fetcher = validAuthSessions[0].fetch.bind(validAuthSessions[0]);
      // Get the ExternalChatHandler
      const externalChatHandler = await externalChatHanderFactory(
        chat.uri,
        chat.type,
        { fetcher }
      );
      // Run Startup Task
      await externalChatHandler.runStartupTask();
      // Register Chat Listeners
      await registerChatListeners(chat.uri, {
        optionalExternalChatHandler: externalChatHandler,
        fetcher,
      });
    } catch (err) {
      const chatId = (possibleChat as { _id: string })._id;
      if (chatId) {
        // If there's an error update the chat to reflect that
        await chatCollection.findOneAndUpdate(
          { _id: chatId },
          {
            $set: {
              error: {
                message: err.message,
                metadata: err.metadata || {},
              },
            },
          }
        );
      }
    }
  });
};

export default runAllChatStartupTasks;
