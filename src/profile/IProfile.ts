import { Schema } from "jsonschema";
import validateSchema from "../util/validateSchema";

export default interface IProfile {
  webId: string;
  image?: string;
  name?: string;
  defaultStorageLocation: string;
  searchable?: boolean;
}

const IProfileSchema: Schema = {
  type: "object",
  properties: {
    webId: { type: "string", format: "uri" },
    defaultStorageLocation: { type: "string", format: "uri" },
    image: { type: "string", format: "uri" },
    name: { type: "string" },
    searchable: { type: "boolean" },
  },
  required: ["webId", "defaultStorageLocation"],
};

export function toProfile(potentialProfile: unknown): IProfile {
  return validateSchema(potentialProfile, IProfileSchema);
}
