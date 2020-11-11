import IFetcher from "src/util/IFetcher";
import IChat, { IChatType, toIChat } from "../chat/IChat";
import IMessage from "../message/IMessage";

export default abstract class AbstractExternalChatHandler {
  protected uri: string;
  protected chat: Partial<IChat>;
  // PageNumber: IMessage[]
  protected messages: Record<number, IMessage[]>;
  protected fetcher?: IFetcher;

  constructor(
    chatUrl: string,
    chatType: IChatType,
    options?: {
      fetcher?: IFetcher;
      initialChat?: Partial<IChat>;
    }
  ) {
    this.uri = chatUrl;
    this.chat = { uri: chatUrl, type: chatType, ...options?.initialChat };
    this.messages = {};
    this.fetcher = options?.fetcher;
  }

  protected setMessages(pageNumber: number, messages: IMessage[]): void {
    if (pageNumber === 0) {
      this.chat.lastMessage = messages[0];
    }
    this.messages[pageNumber] = messages;
  }

  async getChat(): Promise<IChat> {
    await Promise.all([
      this.fetchExternalChatIfNedded(),
      this.fetchExternalChatParticipantsIfNeeded(),
      this.fetchExternalChatMessagesIfNeeded(),
    ]);
    return toIChat(this.chat);
  }

  getCurrentChat(): Partial<IChat> {
    return this.chat;
  }

  async fetchExternalChatIfNedded(): Promise<void> {
    if (!this.chat.name || !this.chat.images) {
      await this.fetchExternalChat();
    }
  }

  abstract async fetchExternalChat(): Promise<void>;

  async fetchExternalChatParticipantsIfNeeded(): Promise<void> {
    if (!this.chat.participants || !this.chat.isPublic) {
      await this.fetchExternalChatParticipants();
    }
  }

  abstract async fetchExternalChatParticipants(): Promise<void>;

  async fetchExternalChatMessagesIfNeeded(): Promise<void> {
    if (!this.chat.lastMessage) {
      await this.fetchExternalChatMessages(0);
    }
  }

  abstract async fetchExternalChatMessages(page: number): Promise<void>;

  abstract async addMessage(): Promise<void>;

  abstract async updateExternalChat(): Promise<void>;

  abstract async updateExternalChatParticipants(): Promise<void>;
}
