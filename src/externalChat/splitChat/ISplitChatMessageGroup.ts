import IMessage from '../../message/IMessage';

export interface ISplitChatMessageGroup {
  date: string;
  userMessageGroups: {
    uri: string;
    webId: string;
  }[];
  fetched: boolean;
  messages: IMessage[];
}





interface splitChat {
  title: string
  isPublic: boolean;
  isDiscoverable: boolean;
  participation: {
    messageContainer: string;
    webId: string;
  }[];
  messageGroup: {
    date: Date;
    messageGroup: {
      owner: string;
      messageGroup: []
    }[];
  }[];
}