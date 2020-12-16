import { AnyPointer } from "clownface";
import AbstractExternalChatHandler from "../AbstractExternalChatHandler";
import IChat, { IChatType } from "../../chat/IChat";
import {
  author,
  content,
  dateCreatedElements,
  dateCreatedTerms,
  flowMessage,
  foafImage,
  LongChat,
  maker,
  rdfType,
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
import HttpError from "../../util/HttpError";
import saveExternalChatParticipants from "../util/saveExternalChatParticipants";

export default class LongChatExternalChatHandler extends AbstractExternalChatHandler {
  constructor(
    url: string,
    chatType: IChatType.LongChat,
    options?: {
      fetcher?: IFetcher;
      initialChat?: Partial<IChat>;
    }
  ) {
    let adjustedUrl = url;
    if (url.endsWith("/")) {
      adjustedUrl = `${url}index.ttl#this`;
    } else if (url.endsWith("index.ttl")) {
      adjustedUrl = `${url}#this`;
    } else if (!url.endsWith(`index.ttl#this`)) {
      throw new HttpError(`${url} is an invalid LongChat uri.`, 400, {
        uri: url,
      });
    }
    super(adjustedUrl, chatType, options);
  }

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
    if (!this.chat.images || this.chat.images.length < 1) {
      this.chat.images = participantsResult.participants
        .map((participant) => participant.image)
        .filter((image) => image !== undefined) as string[];
    }
  }

  async fetchExternalChatMessages(
    previousPageId?: string
  ): Promise<IMessage[]> {
    // Get the chat document
    try {
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
    } catch (err) {
      if (
        err.metadata &&
        err.metadata.type === "LONG_CHAT_MESSAGE_NOT_IN_CACHE"
      ) {
        return [];
      }
      throw err;
    }
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

  async createExternalChat(chat: IChat): Promise<void> {
    const chatRoot = getContainerUri(this.uri);
    const administrator = chat.participants.find(
      (participant) => participant.isAdmin
    );
    if (!administrator) {
      throw new HttpError(
        `Created chat must contain at least one participant who is an administrator`,
        400
      );
    }
    // Build Index
    const ds = getBlankClownfaceDataset();
    ds.namedNode(this.uri)
      .addOut(rdfType, LongChat)
      .addOut(author, namedNode(administrator.webId))
      .addOut(
        dateCreatedElements,
        literal(new Date().toISOString(), xslDateTime)
      )
      .addOut(title, chat.name);
    // Save Index
    await patchClownfaceDataset(this.uri, ds, this.fetcher);
    // Save Auth
    await saveExternalChatParticipants(chatRoot, chat.participants, {
      fetcher: this.fetcher,
      isAdmin: {
        read: true,
        write: true,
        append: true,
        control: true,
      },
      hasAccess: {
        read: true,
        write: true,
        append: true,
        control: false,
      },
      isPublic: chat.isPublic,
    });
  }

  updateExternalChat(chat: Partial<IChat>): Promise<void> {
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

  async onChatUpdate(callback: (chatUri: string) => void): Promise<void> {
    longChatWebsocketHandler.onChatUpdate(this.uri, callback);
  }

  async runStartupTask(): Promise<void> {
    try {
      await longChatWebsocketHandler.beginListeningToChat(this.uri, undefined, {
        fetcher: this.fetcher,
      });
    } catch (err) {
      if (err.status === 403) {
        throw new HttpError(
          `Unauthorized to set up WebSockets connection for ${this.chat.uri}`,
          403,
          { chatUri: this.chat.uri, uri: this.chat.uri }
        );
      }
      throw err;
    }
  }
}
