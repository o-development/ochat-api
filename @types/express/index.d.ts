import { Session as AuthSession } from "@inrupt/solid-auth-fetcher";

declare global {
  namespace Express {
    interface Request {
      authSession?: AuthSession;
    }
  }
}
