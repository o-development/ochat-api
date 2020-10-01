import fetch from "@rdfjs/fetch";
import cf from "clownface";
import Clownface from "clownface/lib/Clownface";

export default async function fetchCf(url: string): Promise<Clownface> {
  const dataset = await fetch(url).then((response) => response.dataset());
  return cf({ dataset });
}
