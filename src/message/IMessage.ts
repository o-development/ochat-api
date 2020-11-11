import { Schema } from "jsonschema";
import validateSchema from "../util/validateSchema";

export default interface IMessage {
  maker: string;
  content: string;
  timeCreated: string;
}

export const IMessageSchema: Schema = {
  type: "object",
  properties: {
    maker: { type: "string", format: "uri" },
    content: { type: "string" },
    timeCreated: { type: "string", format: "date-time" },
  },
};

export function toIMessage(potentialIMessage: unknown): IMessage {
  return validateSchema(potentialIMessage, IMessageSchema);
}
