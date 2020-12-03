import { Schema, validate, ValidationError } from "jsonschema";
import HttpError from "../util/HttpError";
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
    console.log(err);
    if (err instanceof ValidationError) {
      throw new HTTPError(err.stack, 400);
    }
    throw new HttpError(err.message, 400);
  }
}
