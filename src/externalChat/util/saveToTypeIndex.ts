import { fetchClownfaceNode, getBlankClownfaceDataset, patchClownfaceDataset } from '../../util/clownFaceUtils';
import HttpError from '../../util/HttpError';
import { FoafPerson, forClass, instance, LongChat, privateTypeIndex, publicTypeIndex, rdfType, SchemaPerson, TypeRegistration } from '../../util/nodes';
import { v4 } from 'uuid';
import IFetcher from '../../util/IFetcher'
import { namedNode } from '@rdfjs/dataset';
import { NamedNode } from 'rdf-js';

export default async function saveToTypeIndex(
  chatUri: string, 
  isPublic: boolean,
  rdfClass: NamedNode,
  options: { fetcher?: IFetcher, webId: string }
) {
  const profileNode = await fetchClownfaceNode(
    options.webId,
    [SchemaPerson, FoafPerson],
    options.fetcher,
    { requireAllTypes: true }
  );
  const predicate = isPublic ? publicTypeIndex : privateTypeIndex;
  const typeIndexUri = profileNode.out(predicate).value;
  if (!typeIndexUri) {
    throw new HttpError('No type index in profile', 404);
  }

  const ds = getBlankClownfaceDataset();
  ds.namedNode(`${typeIndexUri}#${v4()}`)
    .addOut(rdfType, TypeRegistration)
    .addOut(forClass, rdfClass)
    .addOut(instance, namedNode(chatUri));
  await patchClownfaceDataset(typeIndexUri, ds, { fetcher: options.fetcher });
}