import { Schema } from "jsonschema";
import IMessage, { IMessageSchema } from "../message/IMessage";
import validateSchema from "../util/validateSchema";

export enum IChatType {
  LongChat = "LongChat",
  ShortChat = "ShortChat",
}

export interface IChatParticipant {
  name?: string;
  webId: string;
  image?: string;
  isAdmin: boolean;
}

export default interface IChat {
  uri: string;
  type: IChatType;
  name: string;
  images: string[];
  participants: IChatParticipant[];
  isPublic: boolean;
  isDiscoverable?: boolean;
  lastMessage?: IMessage;
  subject?: string;
  error?: { message: string; metadata: Record<string, unknown> };
}

export const IChatPartialSchema: Schema = {
  type: "object",
  properties: {
    uri: { type: "string", format: "uri" },
    type: { type: "string", enum: ["LongChat", "ShortChat"] },
    name: { type: ["string", "null"] },
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
          image: { type: ["string", "null"], format: "uri" },
          isAdmin: { type: "boolean" },
        },
      },
    },
    isPublic: { type: "boolean" },
    isDiscoverable: { type: "boolean" },
    lastMessage: IMessageSchema,
    subject: { type: ["string", "null"] },
    error: {
      type: "object",
      properties: {
        message: { type: "string" },
        metadata: { type: "object", additionalItems: true },
      },
    },
  },
};

const IChatSchema: Schema = {
  ...IChatPartialSchema,
  required: ["uri", "type", "name", "images", "participants", "isPublic"],
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
  // Correct for legacy way of storing data
  const castChat = potentialIChat as IChat
  if (typeof castChat.lastMessage?.content === 'string') {
    castChat.lastMessage.content = { text: [castChat.lastMessage.content] };
  }
  const val = validateSchema(potentialIChat, IChatSchema);
  // Remove Id for MongoDb
  if (!!val && !!(val as { _id?: string })._id) {
    delete (val as { _id?: string })._id;
  }
  return val as IChat;
}

export function toIChatPartial(potentialIChatPartial: unknown): Partial<IChat> {
  return validateSchema(potentialIChatPartial, IChatPartialSchema);
}
