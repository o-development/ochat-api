import { Session as AuthSession } from "@inrupt/solid-auth-fetcher";
import { Server as HttpServer } from "http";
import { Server as SocketServer, Socket } from "socket.io";
import { parse as parseCookie } from "cookie";
import HttpError from "../util/HttpError";
import { sessionManager } from "../util/AuthSessionManager";

const clientOrigin = process.env.CLIENT_ORIGIN;

export default function socketHandler(httpServer: HttpServer): void {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: clientOrigin,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", async (socket: Socket) => {
    let authSession: AuthSession;
    try {
      // socket.io poorly defines "headers" as "object"
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const cookieHeader = socket.handshake.headers.cookie as string;
      if (cookieHeader) {
        const { auth } = parseCookie(cookieHeader);
        console.log(auth);
        if (!auth) {
          throw new HttpError("Authentication must be provided", 401);
        }
        authSession = await sessionManager.getSession(auth);
        if (!authSession.info.isLoggedIn) {
          throw new HttpError("User is not logged in", 403);
        }
      }
    } catch (err) {
      // If it's not authenticated disconnect
      socket.disconnect(true);
    }
  });
}
