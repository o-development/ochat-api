import IChat from "./IChat";
import { getChatCollection } from "../util/MongoClient";
import onChatUpdate from "./onChatUpdate";

export default async function updateChatIndex(
  chatUri: string,
  chatData: Partial<IChat>,
  options: { webId: string }
): Promise<void> {
  const chatCollection = await getChatCollection();
  if (chatData.isPublic || chatData.participants) {
    // Handle updating of participants
  }
  if (chatData.name || chatData.images) {
    // Handle updating of images and name
  }
  try {
    await chatCollection.updateOne(
      {
        uri: chatUri,
        participants: {
          $elemMatch: {
            webId: options.webId,
            isAdmin: true,
          },
        },
      },
      {
        $set: {
          ...chatData,
        },
      }
    );
    onChatUpdate(chatUri);
    return;
  } catch (err) {
    throw err;
  }
}
