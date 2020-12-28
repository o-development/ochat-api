import { EventEmitter } from "events";
import IFetcher from "../../util/IFetcher";
import IMessage from "../../message/IMessage";
import getContainerUri from "../util/getContainerUri";
import { catchUpUriCache } from "./LongChatCache";
import { subscribeToUri } from "../../util/SolidWebSocketManager";
import fetchExternalLongChatMessages from "./fetchExternalLongChatMessages";
import fetchExternalLongChat from "./fetchExternalLongChat";
import IChat from "../../chat/IChat";

class LongChatWebSocketHandler extends EventEmitter {
  onNewMessage(
    chatUri: string,
    callback: (chatUri: string, messages: IMessage[]) => void
  ) {
    this.on(`message:${chatUri}`, callback);
  }

  async onChatUpdate(
    chatUri: string,
    callback: (chatUri: string, updatedChat: Partial<IChat>) => void
  ): Promise<void> {
    this.on(`chat:${chatUri}`, callback);
  }

  async beginListeningToChat(
    chatUri: string,
    currentMostRecentChatPage?: string,
    options?: { fetcher?: IFetcher }
  ) {
    const mostRecentChatPage =
      currentMostRecentChatPage ||
      (await catchUpUriCache(chatUri, { fetcher: options?.fetcher }))[0];

    if (!mostRecentChatPage) {
      // Only listen to the root container because no others exist.
      const rootContainer = getContainerUri(chatUri);
      subscribeToUri(
        rootContainer,
        (containerUri) =>
          this.handleContainerUpdate(chatUri, containerUri, {
            fetcher: options?.fetcher,
          }),
        {
          fetcher: options?.fetcher,
          clearOtherSubscriptionsToThisUriFirst: true,
        }
      );
      return;
    }

    const dayContainer = getContainerUri(mostRecentChatPage);
    const monthContainer = getContainerUri(dayContainer);
    const yearContainer = getContainerUri(monthContainer);
    const rootContainer = getContainerUri(yearContainer);
    await Promise.all([
      subscribeToUri(
        chatUri,
        (updatedChatUri) =>
          this.handleChatUpdate(updatedChatUri, { fetcher: options?.fetcher }),
        {
          fetcher: options?.fetcher,
          clearOtherSubscriptionsToThisUriFirst: true,
        }
      ),
      subscribeToUri(
        rootContainer,
        (containerUri) =>
          this.handleContainerUpdate(chatUri, containerUri, {
            fetcher: options?.fetcher,
          }),
        {
          fetcher: options?.fetcher,
          clearOtherSubscriptionsToThisUriFirst: true,
        }
      ),
      subscribeToUri(
        yearContainer,
        (containerUri) =>
          this.handleContainerUpdate(chatUri, containerUri, {
            fetcher: options?.fetcher,
          }),
        {
          fetcher: options?.fetcher,
          clearOtherSubscriptionsToThisUriFirst: true,
        }
      ),
      subscribeToUri(
        monthContainer,
        (containerUri) =>
          this.handleContainerUpdate(chatUri, containerUri, {
            fetcher: options?.fetcher,
          }),
        {
          fetcher: options?.fetcher,
          clearOtherSubscriptionsToThisUriFirst: true,
        }
      ),
      subscribeToUri(
        mostRecentChatPage,
        (containerUri) =>
          this.handleMessageUpdate(chatUri, containerUri, {
            fetcher: options?.fetcher,
          }),
        {
          fetcher: options?.fetcher,
          clearOtherSubscriptionsToThisUriFirst: true,
        }
      ),
    ]);
  }

  private async handleContainerUpdate(
    chatUri: string,
    containerUri: string,
    options: { fetcher?: IFetcher }
  ) {
    const mostRecentChatPage = (
      await catchUpUriCache(chatUri, { fetcher: options?.fetcher })
    )[0];
    await Promise.all([
      this.beginListeningToChat(chatUri, mostRecentChatPage, {
        fetcher: options.fetcher,
      }),
      this.handleMessageUpdate(chatUri, mostRecentChatPage, {
        fetcher: options?.fetcher,
      }),
    ]);
  }

  private async handleChatUpdate(
    chatUri: string,
    options: { fetcher?: IFetcher }
  ) {
    const newChat = await fetchExternalLongChat(chatUri, {
      fetcher: options.fetcher,
    });
    this.emit(`chat:${chatUri}`, chatUri, newChat);
  }

  private async handleMessageUpdate(
    chatUri: string,
    messageUri: string,
    options: { fetcher?: IFetcher }
  ) {
    const messages: IMessage[] = await fetchExternalLongChatMessages(
      chatUri,
      messageUri,
      { fetcher: options.fetcher }
    );
    this.emit(`message:${chatUri}`, chatUri, messages);
  }
}

const longChatWebSocketHandler = new LongChatWebSocketHandler();
export default longChatWebSocketHandler;
