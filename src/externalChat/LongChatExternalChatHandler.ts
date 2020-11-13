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
import { redisClient } from "src/util/RedisConnection";

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
    const agentAccess = await fetchAcl(
      this.getContainerUri(this.uri),
      this.fetcher
    );
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

  private getContainerUri(uri: string) {
    const containerUri = new URL(uri);
    const splitPathname = containerUri.pathname.split("/");
    splitPathname[splitPathname.length - 1] = "";
    containerUri.pathname = splitPathname.join("/");
    containerUri.hash = "";
    return containerUri.toString();
  }

  private async getPageUrisAfterPageId(
    minUris: number,
    previousPageId?: string
  ): Promise<string[]> {
    // Get PageId year month and day
    let pageIdYear: string | undefined;
    let pageIdMonth: string | undefined;
    let pageIdDay: string | undefined;
    const rootContainer = this.getContainerUri(this.uri);
    if (previousPageId) {
      pageIdDay = this.getContainerUri(previousPageId);
      pageIdMonth = this.getContainerUri(pageIdDay);
      pageIdYear = this.getContainerUri(pageIdMonth);
    }

    let pageUris: string[] = [];
    const yearNodes = await this.getContainedNodesFromContainer(rootContainer);
    let completedFirstYearIteration = false;
    for (
      let y = pageIdYear ? yearNodes.indexOf(pageIdYear) : 0;
      y < yearNodes.length;
      y++
    ) {
      const monthNodes = await this.getContainedNodesFromContainer(
        yearNodes[y]
      );
      for (
        let m =
          completedFirstYearIteration && pageIdMonth
            ? monthNodes.indexOf(pageIdMonth)
            : 0;
        m < monthNodes.length;
        m++
      ) {
        const dayNodes = await this.getContainedNodesFromContainer(
          monthNodes[m]
        );
        pageUris = pageUris.concat(
          dayNodes.map((dayNode) => `${dayNode}chat.ttl#this`)
        );
        if (dayNodes.length >= minUris) {
          return pageUris;
        }
      }
      completedFirstYearIteration = true;
    }
    return pageUris;
  }

  private getRedisKey(chatUrl: string): string {
    return `longChatIndex:${chatUrl}`;
  }

  private async getCachedPageUriAfterPageId(
    previousPageId?: string
  ): Promise<string> {
    // const chats = await redisClient.get(this.getRedisKey(this.uri));
    const uris = await this.getPageUrisAfterPageId(5, previousPageId);
    console.log(uris);
    throw new Error("not implemented");
  }

  async fetchExternalChatMessages(previousPageId?: string): Promise<void> {
    // Get the chat document
    const chatMessageDocumentUrl = await this.getCachedPageUriAfterPageId(
      previousPageId
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
    this.setMessages(chatMessageDocumentUrl, messages);
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
