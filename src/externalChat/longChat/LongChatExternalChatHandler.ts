import { AnyPointer } from "clownface";
import AbstractExternalChatHandler from "../AbstractExternalChatHandler";
import IChat, { IChatType } from "../../chat/IChat";
import {
  content,
  dateCreatedTerms,
  flowMessage,
  foafImage,
  LongChat,
  maker,
  title,
  xslDateTime,
} from "../../util/nodes";
import {
  fetchClownfaceNode,
  getBlankClownfaceDataset,
  patchClownfaceDataset,
} from "../../util/clownFaceUtils";
import IFetcher from "../../util/IFetcher";
import IMessage from "../../message/IMessage";
import { namedNode, literal } from "@rdfjs/dataset";
import fetchExternalChatParticipants from "../util/fetchExternalChatParticipants";
import { addToCache, getLongChatMessageUriFromCache } from "./LongChatCache";
import getContainerUri from "../util/getContainerUri";
import longChatWebsocketHandler from "./LongChatWebsocketHandler";
import fetchExternalLongChatMessages from "./fetchExternalLongChatMessages";

export default class LongChatExternalChatHandler extends AbstractExternalChatHandler {
  static fromClownfaceNode(
    url: string,
    node: AnyPointer,
    options?: { fetcher?: IFetcher }
  ): LongChatExternalChatHandler {
    const instance = new LongChatExternalChatHandler(url, IChatType.LongChat, {
      fetcher: options?.fetcher,
    });
    instance.processClownfaceChatNode(node);
    return instance;
  }

  private processClownfaceChatNode(node: AnyPointer): void {
    this.chat = {
      ...this.chat,
      name: node.out(title).value || "",
      images: node.out(foafImage).values,
    };
  }

  async fetchExternalChat(): Promise<void> {
    const chatNode = await fetchClownfaceNode(
      this.uri,
      [LongChat],
      this.fetcher
    );
    this.processClownfaceChatNode(chatNode);
  }

  async fetchExternalChatParticipants(): Promise<void> {
    const participantsResult = await fetchExternalChatParticipants(this.uri, {
      fetcher: this.fetcher,
      isAdmin: (agentAccess) =>
        agentAccess.read && agentAccess.write && agentAccess.control,
      hasAccess: (agentAccess) => agentAccess.read && agentAccess.write,
    });
    this.chat.isPublic = participantsResult.isPublic;
    this.chat.participants = participantsResult.participants;
  }

  async fetchExternalChatMessages(
    previousPageId?: string
  ): Promise<IMessage[]> {
    // Get the chat document
    const chatMessageDocumentUrl = await getLongChatMessageUriFromCache(
      this.uri,
      previousPageId,
      {
        fetcher: this.fetcher,
      }
    );
    const messages = await fetchExternalLongChatMessages(
      this.uri,
      chatMessageDocumentUrl,
      {
        fetcher: this.fetcher,
      }
    );
    this.setMessages(chatMessageDocumentUrl, messages, !previousPageId);
    return messages;
  }

  async addMessage(message: IMessage): Promise<IMessage> {
    // Construct chat.ttl uri from the date
    const date = new Date(message.timeCreated);
    const rootUri = getContainerUri(this.uri);
    const messagePageUri = `${rootUri}${date.getUTCFullYear()}/${`0${
      date.getUTCMonth() + 1
    }`.slice(-2)}/${`0${date.getUTCDate()}`.slice(-2)}/chat.ttl`;
    const messageUri = `${messagePageUri}#${message.id}`;

    // Patch the file to add message
    const ds = getBlankClownfaceDataset();
    ds.namedNode(messageUri)
      .addOut(maker, namedNode(message.maker))
      .addOut(content, literal(message.content))
      .addOut(dateCreatedTerms, literal(message.timeCreated, xslDateTime))
      .addIn(flowMessage, namedNode(this.uri));
    await patchClownfaceDataset(messagePageUri, ds, this.fetcher);
    await addToCache(this.uri, messagePageUri);
    return {
      ...message,
      page: messagePageUri,
    };
  }

  updateExternalChat(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  updateExternalChatParticipants(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async onNewMessages(
    callback: (chatUri: string, messages: IMessage[]) => void
  ): Promise<void> {
    longChatWebsocketHandler.onNewMessage(this.uri, callback);
  }

  async onChatUpdate(
    callback: (chat: Partial<IChat> & { uri: string }) => void
  ): Promise<void> {
    longChatWebsocketHandler.onChatUpdate(this.uri, callback);
  }

  async runStartupTask(): Promise<void> {
    await longChatWebsocketHandler.beginListeningToChat(this.uri, undefined, {
      fetcher: this.fetcher,
    });
  }
}
