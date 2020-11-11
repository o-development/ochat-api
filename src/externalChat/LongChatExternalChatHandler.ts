import { AnyPointer } from "clownface";
import AbstractExternalChatHandler from "./AbstractExternalChatHandler";
import { IChatType } from "../chat/IChat";
import {
  basicContainer,
  container,
  contains,
  content,
  dateCreatedTerms,
  flowMessage,
  foafImage,
  LongChat,
  maker,
  rdfType,
  ShortChat,
  title,
} from "../util/nodes";
import fetchClownface, { fetchClownfaceDataset } from "../util/fetchClownFace";
import IFetcher from "../util/IFetcher";
import HttpError from "..//util/HttpError";
import IMessage, { toIMessage } from "../message/IMessage";
import { namedNode } from "@rdfjs/dataset";

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
    const chatNode = await fetchClownface(
      this.uri,
      [LongChat, ShortChat],
      this.fetcher
    );
    this.processClownfaceChatNode(chatNode);
  }

  async fetchExternalChatParticipants(): Promise<void> {
    // Check to see if the dataset is public (public has read and append)
    // Check to see the dataset's participants
    // TODO complete this
    this.chat.isPublic = true;
    this.chat.participants = [];
  }

  private async getContainedNodesFromContainer(
    containerUri: string
  ): Promise<string[]> {
    const containerNode = await fetchClownface(
      containerUri,
      [basicContainer, container],
      this.fetcher
    );
    const containedNodes = containerNode
      .out(contains)
      .has(rdfType, [contains, basicContainer])
      .values.sort()
      .reverse();
    return containedNodes;
  }

  private async getLongChatMessageDocumentUrl(
    pageNumber: number
  ): Promise<string> {
    const rootChatUri = new URL(this.uri);
    const splitPathname = rootChatUri.pathname.split("/");
    splitPathname[splitPathname.length - 1] = "";
    rootChatUri.pathname = splitPathname.join("/");
    rootChatUri.hash = "";
    const yearNodes = await this.getContainedNodesFromContainer(
      rootChatUri.toString()
    );
    let discoveredCounter = 0;
    for (let y = 0; y < yearNodes.length; y++) {
      const monthNodes = await this.getContainedNodesFromContainer(
        yearNodes[y]
      );
      for (let m = 0; m < monthNodes.length; m++) {
        const dayNodes = await this.getContainedNodesFromContainer(
          monthNodes[m]
        );
        if (pageNumber > discoveredCounter + dayNodes.length - 1) {
          discoveredCounter += dayNodes.length;
        } else {
          return `${dayNodes[pageNumber - discoveredCounter]}chat.ttl#this`;
        }
      }
    }
    throw new HttpError(
      `No long chat document exists for page ${pageNumber}`,
      404
    );
  }

  async fetchExternalChatMessages(page: number): Promise<void> {
    // Get the chat document
    const chatMessageDocumentUrl = await this.getLongChatMessageDocumentUrl(
      page
    );
    const messageDataset = await fetchClownfaceDataset(
      chatMessageDocumentUrl,
      this.fetcher
    );
    const messageContainerNode = messageDataset.node(namedNode(this.uri));
    const messageNodes = messageContainerNode.out(flowMessage);
    const messages: IMessage[] = messageNodes.map(
      (messageNode): IMessage => {
        const potentialMessage = {
          maker: messageNode.out(maker).value,
          content: messageNode.out(content).value,
          timeCreated: messageNode.out(dateCreatedTerms).value,
        };
        return toIMessage(potentialMessage);
      }
    );
    this.setMessages(page, messages);
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
