import { Schema } from "jsonschema";
import validateSchema from "../util/validateSchema";

export default interface INotificationMuteSetting {
  chatUri: string;
  expires?: {
    duration: number;
    time: string;
  };
}

export const INotificationMuteSettingSchema: Schema = {
  type: "object",
  properties: {
    chatUri: { type: 'string', format: 'url' },
    expires: {
      type: 'object',
      properties: {
        duration: { type: 'number' },
        time: { type: 'string' },
      },
      required: ['duration', 'time'],
    },
  },
  required: ['chatUri'],
};

export function toINotificationMuteSetting(
  potentialINotificationMuteSetting: unknown
): INotificationMuteSetting {
  return validateSchema(
    potentialINotificationMuteSetting,
    INotificationMuteSettingSchema
  ) as INotificationMuteSetting;
}

