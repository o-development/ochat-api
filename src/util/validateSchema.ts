import { Schema, validate } from "jsonschema";
import HTTPError from "../util/HttpError";

export default function validateSchema<T>(value: unknown, schema: Schema): T {
  try {
    if (!value) {
      throw new Error("instance must be defined");
    }
    const validationResult = validate(value, schema, {
      throwError: true,
    });
    return validationResult.instance;
  } catch (err) {
    throw new HTTPError(err.message, 400);
  }
}
