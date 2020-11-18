import IFetcher from "../util/IFetcher";
import IChat, { IChatType, toIChat } from "../chat/IChat";
import IMessage from "../message/IMessage";

export default abstract class AbstractExternalChatHandler {
  protected uri: string;
  protected chat: Partial<IChat>;
  // PageNumber: IMessage[]
  protected messagePages: Record<string, IMessage[]>;
  protected messagePageOrder: string[];
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
    this.messagePages = {};
    this.messagePageOrder = [];
    this.fetcher = options?.fetcher;
  }

  protected setMessages(
    pageId: string,
    messages: IMessage[],
    isLatest?: boolean
  ): void {
    if (isLatest) {
      this.chat.lastMessage = messages[0];
    }
    this.messagePages[pageId] = messages;
    this.messagePageOrder = Object.keys(this.messagePages).sort().reverse();
  }

  async getChat(): Promise<IChat> {
    await Promise.all([
      this.fetchExternalChatIfNedded(),
      this.fetchExternalChatParticipantsIfNeeded(),
      this.fetchExternalChatMessagesIfNeeded(),
    ]);
    return toIChat(this.chat);
  }

  async getMessages(previousPageId?: string): Promise<IMessage[]> {
    return await this.fetchExternalChatMessages(previousPageId);
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
      await this.fetchExternalChatMessages();
    }
  }

  abstract async fetchExternalChatMessages(
    previousPageId?: string
  ): Promise<IMessage[]>;

  abstract async addMessage(): Promise<void>;

  abstract async updateExternalChat(): Promise<void>;

  abstract async updateExternalChatParticipants(): Promise<void>;
}