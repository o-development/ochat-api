import { Schema } from "jsonschema";
import IMessage, { IMessageSchema } from "../message/IMessage";
import validateSchema from "../util/validateSchema";

export enum IChatType {
  LongChat = "LongChat",
  ShortChat = "ShortChat",
}

export interface IChatParticipant {
  name: string;
  webId: string;
  isAdmin: boolean;
}

export default interface IChat {
  uri: string;
  type: IChatType;
  name: string;
  images: string[];
  participants: IChatParticipant[];
  isPublic: boolean;
  lastMessage: IMessage;
}

export const IChatPartialSchema: Schema = {
  type: "object",
  properties: {
    uri: { type: "string", format: "uri" },
    type: { type: "string", enum: ["LongChat", "ShortChat"] },
    name: { type: "string" },
    images: {
      type: "array",
      items: { type: "string", format: "uri" },
    },
    participants: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          webId: { type: "string", format: "uri" },
          isAdmin: { type: "boolean" },
        },
      },
    },
    isPublic: { type: "boolean" },
    lastMessage: IMessageSchema,
  },
};

const IChatSchema: Schema = {
  ...IChatPartialSchema,
  required: [
    "uri",
    "type",
    "name",
    "images",
    "participants",
    "isPublic",
    "lastMessage",
  ],
  properties: {
    ...IChatPartialSchema.properties,
    participants: {
      ...IChatPartialSchema.properties?.participants,
      items: {
        ...IChatPartialSchema.properties?.participants.items,
        required: ["name", "webId", "isAdmin"],
      },
    },
  },
};

export function toIChat(potentialIChat: unknown): IChat {
  return validateSchema(potentialIChat, IChatSchema);
}

export function toIChatPartial(potentialIChatPartial: unknown): Partial<IChat> {
  return validateSchema(potentialIChatPartial, IChatPartialSchema);
}
