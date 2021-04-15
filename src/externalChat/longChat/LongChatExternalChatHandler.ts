import { AnyPointer } from "clownface";
import AbstractExternalChatHandler from "../AbstractExternalChatHandler";
import IChat, { IChatParticipant, IChatType } from "../../chat/IChat";
import {
  author,
  content,
  dateCreatedElements,
  dateCreatedTerms,
  flowMessage,
  isDiscoverable,
  liqidChatFile,
  liqidChatImage,
  liqidChatSignedCredential,
  LongChat,
  maker,
  rdfType,
  title,
  xslBoolean,
  xslDateTime,
} from "../../util/nodes";
import {
  getBlankClownfaceDataset,
  patchClownfaceDataset,
} from "../../util/clownFaceUtils";
import IFetcher from "../../util/IFetcher";
import IMessage from "../../message/IMessage";
import { namedNode, literal } from "@rdfjs/dataset";
import fetchExternalChatParticipants from "../util/fetchExternalChatParticipants";
import { addToCache, getLongChatMessageUriFromCache } from "./longChatCache";
import getContainerUri from "../util/getContainerUri";
import longChatWebsocketHandler from "./LongChatWebsocketHandler";
import fetchExternalLongChatMessages from "./fetchExternalLongChatMessages";
import HttpError from "../../util/HttpError";
import saveExternalChatParticipants from "../util/saveExternalChatParticipants";
import fetchExternalLongChat, {
  processClownfaceChatNode,
} from "./fetchExternalLongChat";
import saveToTypeIndex from './saveToTypeIndex';
import { generateJwtForMessage } from '../util/messageVerificationUtils';

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
    instance.chat = {
      ...instance.chat,
      ...processClownfaceChatNode(node),
    };
    return instance;
  }

  async fetchExternalChat(): Promise<void> {
    this.chat = {
      ...this.chat,
      ...(await fetchExternalLongChat(this.uri, { fetcher: this.fetcher })),
    };
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

    const jwt = await generateJwtForMessage(message);

    // Patch the file to add message
    const ds = getBlankClownfaceDataset();
    const messageNode = ds.namedNode(messageUri)
      .addOut(maker, namedNode(message.maker))
      .addOut(dateCreatedTerms, literal(message.timeCreated, xslDateTime))
      .addOut(liqidChatSignedCredential, literal(jwt))
      .addIn(flowMessage, namedNode(this.uri));

    if (message.content.text) {
      messageNode.addOut(content, literal(message.content.text));
    }
    if (message.content.image) {
      messageNode.addOut(liqidChatImage, namedNode(message.content.image));
    }
    if (message.content.file) {
      messageNode.addOut(liqidChatFile, namedNode(message.content.file));
    }
    await patchClownfaceDataset(messagePageUri, ds, { fetcher: this.fetcher });
    await addToCache(this.uri, messagePageUri);
    return {
      ...message,
      page: messagePageUri,
    };
  }

  async createExternalChat(chat: IChat): Promise<void> {
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
      .addOut(title, chat.name)
      .addOut(isDiscoverable, literal(Boolean(chat.isDiscoverable) ? "1" : "0", xslBoolean))
    // Save Index
    await patchClownfaceDataset(this.uri, ds, { fetcher: this.fetcher });
    // Save to Type Index
    try {
      await saveToTypeIndex(this.uri, chat.isPublic, { fetcher: this.fetcher, webId: administrator.webId });
    } catch (err: unknown) {
      // Do nothing
    }
    // Save Auth
    await this.updateExternalChatParticipants(chat.participants, chat.isPublic);
  }

  async updateExternalChat(newChat: Partial<IChat>): Promise<void> {
    if (newChat.name) {
      await this.fetchExternalChatIfNedded();
      const deleteData = getBlankClownfaceDataset();
      const addData = getBlankClownfaceDataset();
      deleteData.namedNode(this.uri).addOut(title, this.chat?.name || "");
      addData.namedNode(this.uri).addOut(title, newChat.name);
      await patchClownfaceDataset(this.uri, addData, {
        fetcher: this.fetcher,
        cfDatasetToRemove: deleteData,
      });
    }
  }

  async updateExternalChatParticipants(
    participants: IChatParticipant[],
    isPublic: boolean
  ): Promise<void> {
    const chatRoot = getContainerUri(this.uri);
    await saveExternalChatParticipants(chatRoot, participants, {
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
      isPublic: isPublic,
    });
  }

  async onNewMessages(
    callback: (chatUri: string, messages: IMessage[]) => void
  ): Promise<void> {
    longChatWebsocketHandler.onNewMessage(this.uri, callback);
  }

  async onChatUpdate(
    callback: (chatUri: string, updatedChat?: Partial<IChat>) => void
  ): Promise<void> {
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
