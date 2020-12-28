import { Express } from "express";

type IHttpHandler = (app: Express) => void;

export default IHttpHandler;
