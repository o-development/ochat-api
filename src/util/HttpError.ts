export default class HttpError extends Error {
  status: number;
  metadata?: Record<string, unknown>
  constructor(
    message: string,
    status: number,
    metadata?: Record<string, unknown>
  ) {
    super(message);
    this.status = status;
    this.metadata = metadata;
  }
}
