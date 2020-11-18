export default function getContainerUri(uri: string): string {
  const containerUri = new URL(uri);
  const splitPathname = containerUri.pathname.replace(/\/*$/, "").split("/");
  splitPathname[splitPathname.length - 1] = "";
  containerUri.pathname = splitPathname.join("/");
  containerUri.hash = "";
  return containerUri.toString();
}
