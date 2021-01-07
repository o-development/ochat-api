import session from 'express-session';
import { StringifyQuery } from 'url-parse';

declare module 'express-session' {
  export interface SessionData {
    redirect: string;
  }
}