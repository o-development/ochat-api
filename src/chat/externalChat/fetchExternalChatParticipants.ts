import { ChatParticipant } from "../IChat";

export default async function fetchChatParticipants(
  chatUrl: string,
  options?: Partial<{
    indexNewParticipants: boolean;
  }>
): Promise<[boolean, ChatParticipant[]]> {
  // TODO: complete
  return [true, []];
}
