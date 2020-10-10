import { ErrorRequestHandler } from "express";

const handleError: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500);
  res.send(`${err.message}\n${err.stack}`);
};

export default handleError;
