interface AbridgedProfile {
  name: string;
  webId: string;
}

export default interface Chat {
  uri: string;
  name: string;
  images: string[];
  participants: AbridgedProfile[];
  admins: AbridgedProfile[];
  isPublic: boolean;
}
