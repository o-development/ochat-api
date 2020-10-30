import { Schema } from "jsonschema";
import validateSchema from "../util/validateSchema";

export interface IChatParticipant {
  name: string;
  webId: string;
  isAdmin: boolean;
}

export default interface IChat {
  uri: string;
  name: string;
  images: string[];
  participants: IChatParticipant[];
  isPublic: boolean;
  lastMessaged: Date;
  lastMessage: string;
}

const IChatPartialSchema: Schema = {
  type: "object",
  properties: {
    uri: { type: "string", format: "uri" },
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
  },
};

const IChatSchema: Schema = {
  ...IChatPartialSchema,
  required: ["uri", "name", "images", "participants", "isPublic"],
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
