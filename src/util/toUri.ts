import validateSchema from "./validateSchema";

export default function toUri(potentialUrl: string): string {
  return validateSchema(potentialUrl, { type: "string", format: "uri" });
}

export function isUri(potentialUri: string): boolean {
  try {
    toUri(potentialUri);
    return true;
  } catch (err) {
    return false;
  }
}
