import IMessage from '../../message/IMessage';
import { sign, verify } from 'jsonwebtoken';

const JWT_SIGNATURE_KEY: string = process.env.JWT_SIGNATURE_KEY || '';
if (!JWT_SIGNATURE_KEY) {
  throw new Error('JWT_SIGNATURE_KEY must be provided as an environment variable');
}

export interface IMessageVerificationDetails {
  maker: string;
  timeCreated: string;
  content: {
    text?: string[];
    image?: string[];
    file?: string[];
    video?: string[];
  }
}

export async function generateJwtForMessage(message: IMessage): Promise<string> {
  const verificationDetails: IMessageVerificationDetails = {
    maker: message.maker,
    timeCreated: message.timeCreated,
    content: message.content,
  };
  return await sign(verificationDetails, JWT_SIGNATURE_KEY);
}

function areArraysEqual(arr1?: string[], arr2?: string[]): boolean {
  if (!arr1 || !arr2) {
    return !arr1 && !arr2;
  }
  const sortedArr1 = arr1.sort();
  const sortedArr2 = arr2.sort();
  return sortedArr1.every((value, index) => value === sortedArr2[index]);
}

export async function isMessageVerified(message: IMessage, jwt?: string): Promise<boolean> {
  if (!jwt) {
    return false;
  }
  try {
    const verificationDetails: IMessageVerificationDetails = await verify(jwt, JWT_SIGNATURE_KEY) as IMessageVerificationDetails;
    if (!verificationDetails.maker || verificationDetails.maker !== message.maker) {
      return false;
    }
    if (
      !areArraysEqual(message.content.text, verificationDetails.content.text) ||
      !areArraysEqual(message.content.image, verificationDetails.content.image) ||
      !areArraysEqual(message.content.file, verificationDetails.content.file) ||
      !areArraysEqual(message.content.video, verificationDetails.content.video)
    ) {
      return false;
    }
    if (message.timeCreated !== verificationDetails.timeCreated) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}