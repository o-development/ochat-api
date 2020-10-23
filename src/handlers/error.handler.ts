import { ErrorRequestHandler } from "express";
import IHandler from "./IHandler";

const errorHandler: IHandler = (app) => {
  const errorRequestHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.error(err);
    if (res.headersSent) {
      return next(err);
    }
    res.status(err.status || 500);
    res.send(`${err.message}\n${err.stack}`);
  };
  app.use(errorRequestHandler);
};

export default errorHandler;
