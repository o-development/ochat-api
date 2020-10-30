import validateSchema from "./validateSchema";

export default function toUri(potentialUrl: string): string {
  return validateSchema(potentialUrl, { type: "string", format: "uri" });
}
