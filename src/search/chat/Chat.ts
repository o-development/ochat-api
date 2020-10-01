export interface ChatParticipant {
  name: string;
  webId: string;
  isAdmin: boolean;
}

export default interface Chat {
  uri: string;
  name: string;
  images: string[];
  participants: ChatParticipant[];
  isPublic: boolean;
}
