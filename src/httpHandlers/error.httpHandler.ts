import { ErrorRequestHandler } from "express";
import IHttpHandler from "./IHttpHandler";

interface IErrorBody {
  message: string;
  metadata: Record<string, unknown>;
  stack?: string;
}

const errorHandler: IHttpHandler = (app) => {
  const errorRequestHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.error(err);
    if (res.headersSent) {
      return next(err);
    }
    res.status(err.status || 500);
    const body: IErrorBody = {
      message: err.message,
      metadata: err.metadata || {},
    };
    if (process.env.ENV === "dev") {
      body.stack = err.stack;
    }
    res.send(body);
  };
  app.use(errorRequestHandler);
};

export default errorHandler;
