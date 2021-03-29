import { getBlankClownfaceDataset, patchClownfaceDataset } from '../../util/clownFaceUtils';
import HttpError from '../../util/HttpError';
import { participant, participation, isAdmin, xslBoolean, messageContainer } from '../../util/nodes';
import IChat, { IChatParticipant } from '../../chat/IChat';
import IFetcher from '../../util/IFetcher';
import saveExternalChatParticipants from '../util/saveExternalChatParticipants';
import Clownface from "clownface/lib/Clownface";
import getDocumentUri from '../util/getDocumentUri';
import { v4 } from 'uuid';
import { literal, namedNode } from '@rdfjs/dataset';
import { AnyPointer } from 'clownface';
import fetchExternalProfile from '../../profile/externalProfile/fetchExternalProfile';

export function addSplitChatParticipantsToDataset(chatUri: string, participants: IChatParticipant[], ds: Clownface): Clownface {
  // Ensure that the participants have a messageContainer
  if (!participants.every((participant) => participant.messageContainer != undefined)) {
    throw new HttpError('Every SplitChat participant must have a messageContainer', 400);
  }

  const chatNode = ds.namedNode(chatUri);
  participants.forEach((p) => {
    const participantNodeUri = `${getDocumentUri(chatUri)}#${v4()}`;
    chatNode.addOut(participation, namedNode(participantNodeUri));
    const participationNode = ds.namedNode(participantNodeUri);
    participationNode.addOut(participant, p.webId);
    participationNode.addOut(isAdmin, literal(p.isAdmin ? '0' : '1', xslBoolean));
    participationNode.addOut(messageContainer, namedNode(p.messageContainer as string));
  });
  return ds;
}

export async function updateSplitChatPermissions(
  chatUri: string,
  newParticipants: IChatParticipant[],
  newIsPublic: boolean,
  options: { fetcher?: IFetcher }
): Promise<void> {
  await saveExternalChatParticipants(chatUri, newParticipants, {
    fetcher: options.fetcher,
    isAdmin: {
      read: true,
      write: true,
      append: true,
      control: true,
    },
    hasAccess: {
      read: true,
      write: false,
      append: true,
      control: false,
    },
    isPublic: newIsPublic,
  });
}

export async function updateSplitChatParticipants(
  currentChat: IChat,
  newParticipants: IChatParticipant[],
  newIsPublic: boolean,
  options: { fetcher?: IFetcher }
) {
  

  await updateSplitChatPermissions(currentChat.uri, newParticipants, newIsPublic, options);

  // Update Triples listing metadata
  const deleteData = currentChat.participants ?
    addSplitChatParticipantsToDataset(
      currentChat.uri,
      currentChat.participants,
      getBlankClownfaceDataset()
    ) : getBlankClownfaceDataset();
  const addData = addSplitChatParticipantsToDataset(
    currentChat.uri,
    newParticipants,
    getBlankClownfaceDataset()
  );
  await patchClownfaceDataset(currentChat.uri, addData, {
    fetcher: options.fetcher,
    cfDatasetToRemove: deleteData,
  });
}

export async function getParticipantsFromClownfaceNode(node: AnyPointer, options: { fetcher?: IFetcher }): Promise<IChatParticipant[]> {
  const participants: IChatParticipant[] = [];
  const participationNodes = node.out(participation).toArray();
  await Promise.all(participationNodes.map(async (participationNode): Promise<void>  => {
    const webId = participationNode.out(participant).value;
    const messageContainerValue = participationNode.out(messageContainer).value;
    if (!webId) {
      return;
    }
    const externalProfile = await fetchExternalProfile(webId, {
      fetcher: options.fetcher,
    });
    participants?.push({
      webId,
      isAdmin: participationNode.out(isAdmin).value === "true",
      name: externalProfile.name || "",
      image: externalProfile.image,
      messageContainer: messageContainerValue,
    });
  }))
  return participants;
}