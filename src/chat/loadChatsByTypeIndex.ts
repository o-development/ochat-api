import { AnyPointer } from "clownface";
import { fetchClownfaceDataset, fetchClownfaceNode } from "../util/clownFaceUtils";
import { FoafPerson, LongChat, privateTypeIndex, publicTypeIndex, SchemaPerson, forClass, instance } from "../util/nodes";
import IFetcher from "../util/IFetcher";
import newChatIndex from './newChatIndex';
import HttpError from "../util/HttpError";

export async function getTypeIndexUris(options: { fetcher?: IFetcher, webId: string }): Promise<string[]> {
  // Get WebId to discover the type index
  const profileNode = await fetchClownfaceNode(
    options.webId,
    [SchemaPerson, FoafPerson],
    options.fetcher,
    { requireAllTypes: true }
  );

  const typeIndexUris: string[] = 
    profileNode.out(privateTypeIndex).values
    .concat(profileNode.out(publicTypeIndex).values)
    .filter((val): boolean => val != undefined) as string[];

  return typeIndexUris;
}

export default async function loadChatsByTypeIndex(options: { fetcher?: IFetcher, webId: string }): Promise<void> {
  const typeIndexUris = await getTypeIndexUris(options);
  if (typeIndexUris.length === 0) {
    throw new HttpError('Your profile does not have any type indexes. You must link chats manually.', 404);
  }
  // Get chat uris from the type index
  const chatUris: string[] = (await Promise.all(
    typeIndexUris.map(async (typeIndexUri): Promise<string[]> => {
      const dataset = await fetchClownfaceDataset(typeIndexUri, options.fetcher);
      const qualifiedQuads = dataset.dataset.match(null, forClass, LongChat)
      const chatUris = [];
      for (const quad of qualifiedQuads) {
        const indexNode = dataset.namedNode(quad.subject.value);
        const chatUri = indexNode.out(instance).value;
        if (chatUri) {
          chatUris.push(chatUri);
        }
      }
      return chatUris;
    })
  )).flat();

  await Promise.all(chatUris.map(async (chatUri) => {
    try {
      await newChatIndex(chatUri, {
        fetcher: options.fetcher,
        webId: options.webId,
      });
    } catch {
      // Ignore
    }
  }));
}