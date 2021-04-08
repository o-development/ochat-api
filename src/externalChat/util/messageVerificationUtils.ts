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
    text?: string;
  }
}

export async function generateJwtForMessage(message: IMessage): Promise<string> {
  const verificationDetails: IMessageVerificationDetails = {
    maker: message.maker,
    timeCreated: message.timeCreated,
    content: {
      text: message.content
    }
  };
  return await sign(verificationDetails, JWT_SIGNATURE_KEY);
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
    if (message.content !== verificationDetails.content.text) {
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