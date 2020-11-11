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
import HttpError from "../util/HttpError";
import IMessage, { toIMessage } from "../message/IMessage";
import { namedNode } from "@rdfjs/dataset";
import fetchAcl from "../util/fetchAcl";
import { Access } from "@inrupt/solid-client";
import fetchExternalProfile from "../profile/externalProfile/fetchExternalProfile";

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

  private hasAccess(agentAccess: Access): boolean {
    // User requires write access to make new files
    return agentAccess.read && agentAccess.write;
  }

  private isAdmin(agentAccess: Access): boolean {
    return agentAccess.read && agentAccess.write && agentAccess.control;
  }

  async fetchExternalChatParticipants(): Promise<void> {
    const agentAccess = await fetchAcl(this.getRootChatUri(), this.fetcher);
    this.chat.isPublic = this.hasAccess(agentAccess.public);

    const webIdsWithAccess = Object.keys(agentAccess)
      .filter((key) => key !== "public")
      .filter((webId) => this.hasAccess(agentAccess[webId]));
    this.chat.participants = [];
    await Promise.all(
      webIdsWithAccess.map(async (webId) => {
        this.chat.participants?.push({
          webId,
          isAdmin: this.isAdmin(agentAccess[webId]),
          name:
            (await fetchExternalProfile(webId, { fetcher: this.fetcher }))
              .name || "",
        });
      })
    );
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

  private getRootChatUri() {
    const rootChatUri = new URL(this.uri);
    const splitPathname = rootChatUri.pathname.split("/");
    splitPathname[splitPathname.length - 1] = "";
    rootChatUri.pathname = splitPathname.join("/");
    rootChatUri.hash = "";
    return rootChatUri.toString();
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
      this.getRootChatUri()
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
