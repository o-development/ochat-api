import cf from "clownface";
import { dataset as Dataset } from "@rdfjs/dataset";
import ParserN3 from "@rdfjs/parser-n3";
import { Readable } from "stream";
import Clownface from "clownface/lib/Clownface";
import fetchType from "../util/fetcherType";
import nodeFetch from "node-fetch";
import DatasetCore from "@rdfjs/dataset/DatasetCore";

export default async function fetchCf(
  url: string,
  // There's some typing error with this that I can't be bothered to fix at the moment
  // As long as you don't use the "Request" from "RequestInfo" you're fine - Jackson
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  fetcher: fetchType = nodeFetch
): Promise<Clownface> {
  const ttl = await (await fetcher(url)).text();

  const dataset = await new Promise<DatasetCore>(async (resolve, reject) => {
    const dataset = Dataset();

    const parserN3 = new ParserN3({ baseIRI: url });
    const input = new Readable({
      read: () => {
        input.push(ttl);
        input.push(null);
      },
    });
    const output = parserN3.import(input);
    output.on("data", (quad) => {
      dataset.add(quad);
    });
    // output.on("prefix", (prefix, ns) => {
    //   // consol.log(`prefix: ${prefix} ${ns.value}`)
    // });
    output.on("end", () => {
      resolve(dataset);
    });
    output.on("error", (err) => {
      reject(err);
    });
  });

  return cf({ dataset });
}
