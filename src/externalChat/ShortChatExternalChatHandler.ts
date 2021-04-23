import { AnyPointer } from "clownface";
import AbstractExternalChatHandler from "./AbstractExternalChatHandler";
import IChat, { IChatType } from "../chat/IChat";
import IFetcher from "../util/IFetcher";
import IMessage from "../message/IMessage";

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

  fetchExternalChatMessages(previousPageId?: string): Promise<IMessage[]> {
    throw new Error("Method not implemented.");
  }

  addMessage(message: IMessage): Promise<IMessage> {
    throw new Error("Method not implemented.");
  }

  createExternalChat(chat: IChat): Promise<void> {
    throw new Error("Method not implemented.");
  }

  updateExternalChat(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  updateExternalChatParticipants(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  onNewMessages(
    callback: (chatUri: string, messages: IMessage[]) => Promise<void>
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }

  onChatUpdate(
    callback: (chatUri: string, updatedChat?: Partial<IChat>) => Promise<void>
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }

  runStartupTask(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  saveFile(body: Buffer, mimeType: string, fileName: string): Promise<string> {
    throw new Error("Method not implemented.");
  }
}
