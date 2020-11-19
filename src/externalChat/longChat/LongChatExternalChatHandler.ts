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
  fetchClownfaceDataset,
  getBlankClownfaceDataset,
  patchClownfaceDataset,
} from "../../util/clownFaceUtils";
import IFetcher from "../../util/IFetcher";
import IMessage, { toIMessage } from "../../message/IMessage";
import { namedNode, literal } from "@rdfjs/dataset";
import fetchExternalChatParticipants from "../util/fetchExternalChatParticipants";
import {
  addToCache,
  catchUpUriCache,
  getLongChatMessageUriFromCache,
} from "./LongChatCache";
import getContainerUri from "../util/getContainerUri";
import { subscribeToUri } from "../../util/SolidWebSocketManager";

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
    const messageDataset = await fetchClownfaceDataset(
      chatMessageDocumentUrl,
      this.fetcher
    );
    const messageContainerNode = messageDataset.node(namedNode(this.uri));
    const messageNodes = messageContainerNode.out(flowMessage);
    const messages: IMessage[] = messageNodes.map(
      (messageNode): IMessage => {
        const nodeHash = new URL(messageNode.value).hash;
        const potentialMessage = {
          id: nodeHash.substring(1),
          page: chatMessageDocumentUrl,
          maker: messageNode.out(maker).value,
          content: messageNode.out(content).value,
          timeCreated: messageNode.out(dateCreatedTerms).value,
        };
        return toIMessage(potentialMessage);
      }
    );
    this.setMessages(chatMessageDocumentUrl, messages, !previousPageId);
    return messages;
  }

  async addMessage(message: IMessage): Promise<IMessage> {
    // Construct chat.ttl uri from the date
    const date = new Date(message.timeCreated);
    const rootUri = getContainerUri(this.uri);
    const messagePageUri = `${rootUri}${date.getFullYear()}/${
      date.getMonth() + 1
    }/${date.getDate()}/chat.ttl`;
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

  async onNewMessage(
    callback: (chatUri: string, message: IMessage) => void
  ): Promise<void> {
    await subscribeToUri(
      "https://jackson.solidcommunity.net/public/AnotherLongChat/2020/11/19/chat.ttl",
      (uriUpdate) => {
        console.log(uriUpdate);
      }
    );
  }

  async onChatUpdate(
    callback: (chat: Partial<IChat> & { uri: string }) => void
  ): Promise<void> {
    console.log("Called onChatUpdate");
  }

  async runStartupTask(): Promise<void> {
    await catchUpUriCache(this.uri, { fetcher: this.fetcher });
  }
}
