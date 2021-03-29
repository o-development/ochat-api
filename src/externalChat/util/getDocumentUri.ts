export default function getDocumentUri(uri: string): string {
  const containerUri = new URL(uri);
  containerUri.hash = "";
  return containerUri.toString();
}
