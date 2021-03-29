import { AnyPointer } from "clownface";
import AbstractExternalChatHandler from "../AbstractExternalChatHandler";
import IChat, { IChatParticipant, IChatType } from "../../chat/IChat";
import IFetcher from "../../util/IFetcher";
import IMessage from "../../message/IMessage";
import createSplitChat from './createSplitChat';
import { updateSplitChatParticipants } from './splitChatParticipantUtils';

export default class SplitChatExternalChatHandler extends AbstractExternalChatHandler {
  constructor(
    url: string,
    chatType: IChatType.SplitChat,
    options?: {
      fetcher?: IFetcher;
      initialChat?: Partial<IChat>;
    }
  ) {
    super(url, chatType, options);
  }

  static fromClownfaceNode(
    url: string,
    node: AnyPointer,
    options?: { fetcher?: IFetcher }
  ): SplitChatExternalChatHandler {
    throw new Error('Not Implented');
  }

  async fetchExternalChat(): Promise<void> {
    throw new Error('Not Implented');
  }

  async fetchExternalChatParticipants(): Promise<void> {
    await this.fetchExternalChatIfNedded();
  }

  async fetchExternalChatMessages(
    previousPageId?: string
  ): Promise<IMessage[]> {
    throw new Error('Not Implemented');
  }

  async addMessage(message: IMessage): Promise<IMessage> {
    throw new Error('Not Implemented');
  }

  /**
   * Create and save all data for a new chat
   * @param chat
   */
  async createExternalChat(chat: IChat): Promise<void> {
    // Save chat to Pod
    await createSplitChat(chat, { fetcher: this.fetcher });
    // Save chat to object
    this.chat = chat;
  }

  async updateExternalChat(newChat: Partial<IChat>): Promise<void> {
    throw new Error('Not Implemented');
  }

  async updateExternalChatParticipants(
    participants: IChatParticipant[],
    isPublic: boolean
  ): Promise<void> {
    // Get current status
    await this.fetchExternalChatIfNedded();
    await updateSplitChatParticipants(this.chat as IChat, participants, isPublic, { fetcher: this.fetcher });
  }

  async onNewMessages(
    callback: (chatUri: string, messages: IMessage[]) => void
  ): Promise<void> {
    throw new Error('Not Implemented');
  }

  async onChatUpdate(
    callback: (chatUri: string, updatedChat?: Partial<IChat>) => void
  ): Promise<void> {
    throw new Error('Not Implemented');
  }

  async runStartupTask(): Promise<void> {
    throw new Error('Not Implemented');
  }
}
