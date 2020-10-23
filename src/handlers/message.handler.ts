import IHandler from "./IHandler";

const messageHandler: IHandler = (app) => {
  app.get("/message/:chat_url", () => {
    // TODO
  });

  app.post("/message/:chat_url", () => {
    // TODO
  });
};

export default messageHandler;
