import { AnyPointer } from "clownface";
import AbstractExternalChatHandler from "./AbstractExternalChatHandler";
import { IChatType } from "../chat/IChat";
import IFetcher from "../util/IFetcher";

export default class ShortChatExternalChatHandler extends AbstractExternalChatHandler {
  static fromClownfaceNode(
    url: string,
    node: AnyPointer,
    options?: { fetcher?: IFetcher }
  ): ShortChatExternalChatHandler {
    const instance = new ShortChatExternalChatHandler(url, IChatType.LongChat, {
      fetcher: options?.fetcher,
    });
    instance.processClownfaceChatNode(node);
    return instance;
  }

  private processClownfaceChatNode(node: AnyPointer): void {
    throw new Error("Method not implemented.");
  }

  fetchExternalChat(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  fetchExternalChatParticipants(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  fetchExternalChatMessages(previousPageId?: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  addMessage(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  updateExternalChat(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  updateExternalChatParticipants(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
