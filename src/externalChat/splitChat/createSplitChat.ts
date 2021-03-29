import IChat from '../../chat/IChat';
import HttpError from '../../util/HttpError';
import { getBlankClownfaceDataset, patchClownfaceDataset } from "../../util/clownFaceUtils";
import { author, dateCreatedElements, isDiscoverable, isPublic, rdfType, SplitChat, title, xslBoolean, xslDateTime } from '../../util/nodes';
import { namedNode, literal } from '@rdfjs/dataset';
import saveToTypeIndex from '../util/saveToTypeIndex';
import IFetcher from '../../util/IFetcher';
import { addSplitChatParticipantsToDataset, updateSplitChatPermissions } from './splitChatParticipantUtils';

export default async function createSplitChat(chat: IChat, options: { fetcher?: IFetcher }) {
  const administrator = chat.participants.find(
    (participant) => participant.isAdmin
  );
  if (!administrator) {
    throw new HttpError(
      `Created chat must contain at least one participant who is an administrator`,
      400
    );
  }
  // Build Index
  let ds = getBlankClownfaceDataset();
  ds.namedNode(chat.uri)
    .addOut(rdfType, SplitChat)
    .addOut(author, namedNode(administrator.webId))
    .addOut(
      dateCreatedElements,
      literal(new Date().toISOString(), xslDateTime)
    )
    .addOut(title, chat.name)
    .addOut(isDiscoverable, literal(Boolean(chat.isDiscoverable) ? "1" : "0", xslBoolean))
    .addOut(isPublic, literal(Boolean(chat.isDiscoverable) ? "1" : "0", xslBoolean))

  ds = addSplitChatParticipantsToDataset(chat.uri, chat.participants, ds);
  await Promise.all([
    // Create the chat metadata
    patchClownfaceDataset(chat.uri, ds, { fetcher: options.fetcher }),
    // Add the dataset to the type index
    (async () => {
      try {
        await saveToTypeIndex(chat.uri, chat.isPublic, SplitChat, { fetcher: options.fetcher, webId: administrator.webId });
      } catch (err: unknown) {
        // Do nothing
      }
    })(),
  ]);
  // Set permissions
  await updateSplitChatPermissions(chat.uri, chat.participants, chat.isPublic, options);
}