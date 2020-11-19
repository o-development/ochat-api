import WebSocket from "ws";
import IFetcher, { guaranteeFetcher } from "./IFetcher";

const globalSockets: Record<string, WebSocket> = {};

const globalConnectingSockets: Record<string, Promise<void>> = {};

export async function subscribeToUri(
  uri: string,
  callback: (uriUpdate: string) => void,
  options?: {
    fetcher?: IFetcher;
  }
): Promise<void> {
  // Discover WebSocket URI
  const trueFetcher = guaranteeFetcher(options?.fetcher);
  const discoveryResult = await trueFetcher(uri);
  const webSocketUri = discoveryResult.headers.get("Updates-Via");
  if (!webSocketUri) {
    throw new Error(`${uri} does not have an "Updates-Via" header.`);
  }

  // Create and Save WebSocket
  let socket: WebSocket;
  if (globalSockets[webSocketUri]) {
    if (globalConnectingSockets[webSocketUri]) {
      await globalConnectingSockets[webSocketUri];
    }
    socket = globalSockets[webSocketUri];
  } else {
    socket = new WebSocket(webSocketUri);
    globalSockets[webSocketUri] = socket;
    globalConnectingSockets[webSocketUri] = new Promise((resolve, reject) => {
      socket.on("open", () => {
        socket.removeListener("error", reject);
        delete globalConnectingSockets[webSocketUri];
        resolve();
      });
      socket.on("error", reject);
    });
    await globalConnectingSockets[webSocketUri];
  }

  // Subscribe to a resource
  const awaitSubscribeToResource = new Promise((resolve) => {
    const onSubscriptionSuccessful = (data: string) => {
      if (data === `ack ${uri}`) {
        socket.removeListener("message", onSubscriptionSuccessful);
        resolve();
      }
    };
    socket.on("message", onSubscriptionSuccessful);
  });
  socket.send(`sub ${uri}`);
  await awaitSubscribeToResource;

  // Setup callback
  socket.on("message", (data) => {
    if (data === `pub ${uri}`) {
      callback(uri);
    }
  });
}
