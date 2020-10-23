import { Express } from "express";

type IHandler = (app: Express) => void;

export default IHandler;
