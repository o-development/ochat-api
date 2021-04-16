import IHttpHandler from "./IHttpHandler";
import getLoggedInAuthSession from "../util/getLoggedInAuthSession";
import HttpError from "../util/HttpError";
import multer from 'multer';
import toUri from "../util/toUri";

const fileUploadHandler: IHttpHandler = (app) => {
  const uploadMiddleware = multer({
    limits: {
      fieldSize: Infinity,
    }
  });

  // New Chat
  app.post("/file-upload", uploadMiddleware.single('file'), async (req, res) => {
    const authSession = getLoggedInAuthSession(req);
    const fetch = authSession.fetch.bind(authSession);
    if (
      (!req.query.chat_uri || typeof req.query.chat_uri !== "string") ||
      (!req.query.mime_type || typeof req.query.mime_type !== "string") ||
      (!req.query.file_name || typeof req.query.file_name !== "string")
    ) {
      throw new HttpError(
        "Must have chat_uri, mime_type, and file_name",
        400
      );
    }
    const chatUri = toUri(req.query.chat_uri as string);
    const mimeType = req.query.mime_type;
    const fileName = req.query.file_name;

    
    const fetchUri = `https://jackson.solidcommunity.net/public/public-writable/${fileName}`;
    const response = await fetch(fetchUri, {
      method: 'PUT',
      body: req.file.buffer,
      headers: {
        "content-type": mimeType
      }
    });
    if (response.status === 200 || response.status === 201) {
      res.status(201).send(fetchUri);
    } else {
      throw new HttpError('Could not upload to Pod.', 500);
    }
  });
};

export default fileUploadHandler;
