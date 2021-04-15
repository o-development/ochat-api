import { Schema } from "jsonschema";
import validateSchema from "../util/validateSchema";

export default interface IMessage {
  id: string;
  page: string;
  maker: string;
  content: {
    text?: string[];
    image?: string[];
    file?: string[];
    video?: string[];
  };
  timeCreated: string;
  isInvalid?: boolean;
}

export interface IMessageCreationData {
  id?: string;
  maker: string;
  content: {
    text?: string[];
    image?: string[];
    file?: string[];
    video?: string[];
  };
}

export const IMessageSchema: Schema = {
  type: "object",
  properties: {
    id: { type: "string" },
    page: { type: "string" },
    maker: { type: "string", format: "uri" },
    content: {
      type: "object",
      properties: {
        text: { type: "array", items: { type: 'string' } },
        image: { type: "array", items: { type: 'string' } },
        file: { type: "array", items: { type: 'string' } },
        video: { type: "array", items: { type: 'string' } },
      }
    },
    timeCreated: { type: "string", format: "date-time" },
    isInvalid: { type: "boolean" },
  },
  required: ["id", "page", "maker", "content", "timeCreated"],
};

export const IMessageCreationDataSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    maker: { type: "string", format: "uri" },
    content: {
      type: "object",
      properties: {
        text: { type: "array", items: { type: 'string' } },
        image: { type: "array", items: { type: 'string' } },
        file: { type: "array", items: { type: 'string' } },
        video: { type: "array", items: { type: 'string' } },
      },
    },
  },
  required: ["maker", "content"],
};

export function toIMessage(potentialIMessage: unknown): IMessage {
  return validateSchema(potentialIMessage, IMessageSchema);
}

export function toIMessageCreationData(
  potentialIMessageCreationData: unknown
): IMessageCreationData {
  return validateSchema(
    potentialIMessageCreationData,
    IMessageCreationDataSchema
  );
}
