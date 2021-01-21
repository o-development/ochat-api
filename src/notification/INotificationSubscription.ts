import { Schema } from "jsonschema";
import validateSchema from "../util/validateSchema";

export type INotificationSubscription =
  | IWebNotificationSubscription
  | IMobileNotificationSubscription;

export interface IBaseNotificationSubscription {
  type: string;
  subscription: unknown;
}

export interface IWebNotificationSubscription
  extends IBaseNotificationSubscription {
  type: "web";
  subscription: IWebSubscription;
}

export interface IWebSubscription {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface IMobileNotificationSubscription
  extends IBaseNotificationSubscription {
  type: "mobile";
  subscription: string;
}

export const INotificationSubscriptionSchema: Schema = {
  oneOf: [
    {
      type: "object",
      properties: {
        type: { type: "string", const: "web" },
        subscription: {
          type: "object",
          properties: {
            endpoint: { type: "string", format: "uri" },
            expirationTime: { type: [ "string", "null" ] },
            keys: {
              type: "object",
              properties: {
                p256dh: { type: "string" },
                auth: { type: "string" },
              },
              required: ["p256dh", "auth"],
            },
          },
          required: ["endpoint", "keys"],
        },
      },
      required: ["type", "subscription"],
    },
    {
      type: "object",
      properties: {
        type: { type: "string", const: "mobile" },
        subscription: { type: "string" },
      },
      required: ["type", "subscription"],
    },
  ],
};

export function toINotificationSubscription(
  potentialINotificationSubscription: unknown
): INotificationSubscription {
  const val = validateSchema(
    potentialINotificationSubscription,
    INotificationSubscriptionSchema
  );
  return val as INotificationSubscription;
}
