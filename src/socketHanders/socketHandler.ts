import { Session as AuthSession } from "@inrupt/solid-auth-fetcher";
import { Server as HttpServer } from "http";
import { Server as SocketServer, Socket } from "socket.io";
import { parse as parseCookie } from "cookie";
import HttpError from "../util/HttpError";
import { sessionManager } from "../util/AuthSessionManager";

const clientOrigin = process.env.CLIENT_ORIGIN;

// Sockets is a map of webIds to a list of sockets
export const sockets: Record<string, Socket[]> = {};

export function sendToSocketByWebId(
  webId: string,
  event: string,
  ...data: unknown[]
): void {
  const socketsToSend = sockets[webId];
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
      // socket.io poorly defines "headers" as "object"
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const cookieHeader = socket.handshake.headers.cookie as string;
      if (cookieHeader) {
        const { auth } = parseCookie(cookieHeader);
        if (!auth) {
          throw new HttpError("Authentication must be provided", 401);
        }
        authSession = await sessionManager.getSession(auth);
        if (!authSession.info.isLoggedIn || !authSession.info.webId) {
          throw new HttpError("User is not logged in", 403);
        }

        // Add to the sockets list
        const webId = authSession.info.webId;
        if (sockets[webId]) {
          sockets[webId].push(socket);
        } else {
          sockets[webId] = [socket];
        }
        // Clean up
        socket.on("close", () => {
          const socketIndex = sockets[webId].indexOf(socket);
          if (socketIndex > -1) {
            sockets[webId].splice(socketIndex, 1);
          }
        });
      }
    } catch (err) {
      // If it's not authenticated disconnect
      socket.disconnect(true);
    }
  });
}
