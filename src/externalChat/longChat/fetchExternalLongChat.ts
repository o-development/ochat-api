import { AnyPointer } from "clownface";
import IChat from "../../chat/IChat";
import { fetchClownfaceNode } from "../../util/clownFaceUtils";
import IFetcher from "../../util/IFetcher";
import { foafImage, isDiscoverable, LongChat, title } from "../../util/nodes";

export default async function fetchExternalLongChat(
  uri: string,
  options: { fetcher?: IFetcher }
): Promise<Partial<IChat>> {
  const chatNode = await fetchExternalLongChatClownface(uri, {
    fetcher: options.fetcher,
  });
  return processClownfaceChatNode(chatNode);
}

export async function fetchExternalLongChatClownface(
  uri: string,
  options: { fetcher?: IFetcher }
): Promise<AnyPointer> {
  return await fetchClownfaceNode(uri, [LongChat], options.fetcher);
}

export function processClownfaceChatNode(
  node: AnyPointer,
  optionalChatInfo: Partial<IChat> = {}
): Partial<IChat> {
  return {
    ...optionalChatInfo,
    name: node.out(title).value || "",
    images: node.out(foafImage).values,
    isDiscoverable: node.out(isDiscoverable).value === "true"
  };
}
