import WebSocket from "ws";
import IFetcher, { guaranteeFetcher } from "./IFetcher";
import { EventEmitter } from "events";

const globalSockets: Record<string, WebSocket> = {};

const globalConnectingSockets: Record<string, Promise<void>> = {};

const socketEventEmitter = new EventEmitter();

export async function subscribeToUri(
  uri: string,
  callback: (uriUpdate: string) => void,
  options?: {
    fetcher?: IFetcher;
    clearOtherSubscriptionsToThisUriFirst?: boolean;
  }
): Promise<void> {
  console.log(`Subscribed to ${uri}`);
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
    // Create a new WebSocket
    socket = new WebSocket(webSocketUri);
    globalSockets[webSocketUri] = socket;
    globalConnectingSockets[webSocketUri] = new Promise<void>(
      (resolve, reject) => {
        socket.on("open", () => {
          socket.removeListener("error", reject);
          delete globalConnectingSockets[webSocketUri];
          resolve();
        });
        socket.on("error", reject);
      }
    );
    socket.on("message", (data: string) => {
      const updatedUri = data.substr(4);
      socketEventEmitter.emit(updatedUri, updatedUri);
    });
    await globalConnectingSockets[webSocketUri];
  }

  // Subscribe to a resource
  const awaitSubscribeToResource = new Promise<void>((resolve) => {
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
  if (options?.clearOtherSubscriptionsToThisUriFirst) {
    socketEventEmitter.removeAllListeners(uri);
  } else {
    socketEventEmitter.removeListener(uri, callback);
  }
  socketEventEmitter.on(uri, callback);
}
