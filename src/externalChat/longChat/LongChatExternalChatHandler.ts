import { AnyPointer } from "clownface";
import AbstractExternalChatHandler from "../AbstractExternalChatHandler";
import { IChatType } from "../../chat/IChat";
import {
  content,
  dateCreatedTerms,
  flowMessage,
  foafImage,
  LongChat,
  maker,
  title,
} from "../../util/nodes";
import fetchClownface, {
  fetchClownfaceDataset,
} from "../../util/fetchClownFace";
import IFetcher from "../../util/IFetcher";
import IMessage, { toIMessage } from "../../message/IMessage";
import { namedNode } from "@rdfjs/dataset";
import fetchExternalChatParticipants from "../util/fetchExternalChatParticipants";
import { getLongChatMessageUriFromCache, isInCache } from "./LongChatCache";
import getContainerUri from "../util/getContainerUri";

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
    const chatNode = await fetchClownface(this.uri, [LongChat], this.fetcher);
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
    }/${date.getDate()}/chat.ttl#this`;
    // Check to see if chat.ttl uri is in cache
    if (await isInCache(this.uri, messagePageUri)) {
      // If yes, send a patch to add the message
      console.log("in cache");
    } else {
      // If not, create it and put message in
      // Save created uri to cache
      console.log("not in cache");
    }
    throw new Error("Not Implemented");
  }

  updateExternalChat(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  updateExternalChatParticipants(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
