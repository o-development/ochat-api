import { Schema } from "jsonschema";
import IMessage, { IMessageSchema } from "../message/IMessage";
import validateSchema from "../util/validateSchema";

export interface INotificationWebSubscription {
  endpoint: string;
  expirationTime?: string;
  keys: {
    p256dh: string;
    auth: string;
  }
}

export const INotificationWebSubscriptionSchema: Schema = {
  type: "object",
  properties: {
    endpoint: { type: "string", format: "uri" },
    expirationTime: { type: "string" },
    keys: {
      type: "object",
      properties: {
        p256dh: { type: "string" },
        auth: { type: "string" },
      },
      required: ['p256dh', 'auth']
    },
  },
  required: ['endpoint', 'keys']
};

export function toINotificationWebSubscription(
  potentialINotificationWebSubscription: unknown
): INotificationWebSubscription {
  const val = validateSchema(
    potentialINotificationWebSubscription,
    INotificationWebSubscriptionSchema
  );
  return val as INotificationWebSubscription;
}
