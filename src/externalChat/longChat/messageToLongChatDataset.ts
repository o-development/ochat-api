import Clownface from "clownface/lib/Clownface";
import IMessage from '../../message/IMessage';
import getContainerUri from '../util/getContainerUri';
import { generateJwtForMessage } from '../util/messageVerificationUtils';
import { v4 } from "uuid";
import {
  content,
  contentUrl,
  dateCreatedTerms,
  flowMessage,
  ImageObject,
  MediaObject,
  liqidChatSignedCredential,
  maker,
  rdfType,
  VideoObject,
  xslDateTime,
} from "../../util/nodes";
import {
  getBlankClownfaceDataset,
} from "../../util/clownFaceUtils";
import { namedNode, literal } from "@rdfjs/dataset";

export default async function messageToLongChatDataset(message: IMessage, chatUri: string): Promise<[string, Clownface]> {
  // Construct chat.ttl uri from the date
  const date = new Date(message.timeCreated);
  const rootUri = getContainerUri(chatUri);
  const messagePageUri = `${rootUri}${date.getUTCFullYear()}/${`0${
    date.getUTCMonth() + 1
  }`.slice(-2)}/${`0${date.getUTCDate()}`.slice(-2)}/chat.ttl`;
  const messageUri = `${messagePageUri}#${message.id}`;

  const jwt = await generateJwtForMessage(message);

  // Patch the file to add message
  const ds = getBlankClownfaceDataset();
  const messageNode = ds.namedNode(messageUri)
    .addOut(maker, namedNode(message.maker))
    .addOut(dateCreatedTerms, literal(message.timeCreated, xslDateTime))
    .addOut(liqidChatSignedCredential, literal(jwt))
    .addIn(flowMessage, namedNode(chatUri));
  if (message.content.text) {
    message.content.text.forEach((text) => {
      messageNode.addOut(content, literal(text));
    });
  }
  if (message.content.image) {
    message.content.image.forEach((imageUri) => {
      const imageNode = ds.namedNode(`${messagePageUri}#${v4()}`);
      imageNode.addOut(rdfType, ImageObject);
      imageNode.addOut(contentUrl, namedNode(imageUri));
      messageNode.addOut(content, imageNode);
    });
  }
  if (message.content.file) {
    message.content.file.forEach((fileUri) => {
      const fileNode = ds.namedNode(`${messagePageUri}#${v4()}`);
      fileNode.addOut(rdfType, MediaObject);
      fileNode.addOut(contentUrl, namedNode(fileUri));
      messageNode.addOut(content, fileNode);
    });
  }
  if (message.content.video) {
    message.content.video.forEach((videoUri) => {
      const fileNode = ds.namedNode(`${messagePageUri}#${v4()}`);
      fileNode.addOut(rdfType, VideoObject);
      fileNode.addOut(contentUrl, namedNode(videoUri));
      messageNode.addOut(content, fileNode);
    });
  }
  return [messagePageUri, ds];
};