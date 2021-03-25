import { Session as AuthSession } from "@inrupt/solid-auth-fetcher";
import { Server as HttpServer } from "http";
import { Server as SocketServer, Socket } from "socket.io";
import { parse as parseCookie } from "cookie";
import HttpError from "../util/HttpError";
import { sessionManager } from "../util/AuthSessionManager";

const clientOrigin = process.env.CLIENT_ORIGIN;

// Sockets is a map of webIds to a list of sockets
export const socketsByWebId: Record<string, Socket[]> = {};
export const socketsByPublicChatUri: Record<string, Socket[]> = {};

export function sendToSocketByWebId(
  webId: string,
  event: string,
  ...data: unknown[]
): void {
  const socketsToSend = socketsByWebId[webId];
  if (socketsToSend) {
    socketsToSend.forEach((socketToSend) => {
      socketToSend.emit(event, ...data);
    });
  }
}

export function sendToSocketByPublicChatUri(
  publicChatUri: string,
  event: string,
  ...data: unknown[]
): void {
  const socketsToSend = socketsByPublicChatUri[publicChatUri];
  if (socketsToSend) {
    socketsToSend.forEach((socketToSend) => {
      socketToSend.emit(event, ...data);
    });
  }
}

export default function socketHandler(httpServer: HttpServer): void {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: clientOrigin,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", async (socket: Socket) => {
    // Authentication
    let authSession: AuthSession;
    try {
      let auth: string;
      // socket.io poorly defines "headers" as "object"
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const cookieHeader = socket.handshake.headers.cookie as string;
      const queryAuthKey = (socket.handshake.query as { authkey: string }).authkey;
      if (cookieHeader) {
        auth = parseCookie(cookieHeader).auth;
      } else if (queryAuthKey) {
        auth = queryAuthKey;
      } else {
        throw new HttpError('No credentials were provided', 401);
      }

      if (!auth) {
        throw new HttpError("Authentication must be provided", 401);
      }
      authSession = await sessionManager.getSession(auth);
      if (!authSession.info.isLoggedIn || !authSession.info.webId) {
        throw new HttpError("User is not logged in", 401);
      }

      // Add to the sockets list
      const webId = authSession.info.webId;
      if (socketsByWebId[webId]) {
        socketsByWebId[webId].push(socket);
      } else {
        socketsByWebId[webId] = [socket];
      }
      // Clean up
      socket.on("close", () => {
        const socketIndex = socketsByWebId[webId].indexOf(socket);
        if (socketIndex > -1) {
          socketsByWebId[webId].splice(socketIndex, 1);
        }
      });
    } catch (err) {
      // If it's not authenticated, do nothing
    }

    // Let the socket subscribe to a public chat, even if not authenticated
    socket.on('subscribeToPublicChat', (data) => {
      const uri = data.uri;
      if (socketsByPublicChatUri[uri]) {
        socketsByPublicChatUri[uri].push(socket);
      } else {
        socketsByPublicChatUri[uri] = [socket];
      }
    });

    socket.on('unsubscribeFromPublicChat', (data) => {
      const uri = data.uri;
      const socketIndex = socketsByPublicChatUri[uri].indexOf(socket);
      if (socketIndex > -1) {
        socketsByPublicChatUri[uri].splice(socketIndex, 1);
      }
    });
  });
}
