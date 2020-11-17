import { Schema } from "jsonschema";
import validateSchema from "../util/validateSchema";

export default interface IMessage {
  id: string;
  page: string;
  maker: string;
  content: string;
  timeCreated: string;
}

export const IMessageSchema: Schema = {
  type: "object",
  properties: {
    id: { type: "string" },
    page: { type: "string" },
    maker: { type: "string", format: "uri" },
    content: { type: "string" },
    timeCreated: { type: "string", format: "date-time" },
  },
  required: ["id", "page", "maker", "content", "timeCreated"],
};

export function toIMessage(potentialIMessage: unknown): IMessage {
  return validateSchema(potentialIMessage, IMessageSchema);
}
