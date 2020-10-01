import { ChatParticipant } from "../Chat";

export default async function fetchChatParticipants(
  chatUrl: string,
  options?: Partial<{
    indexNewParticipants: boolean;
  }>
): Promise<[boolean, ChatParticipant[]]> {
  // TODO: complete
  return [true, []];
}
