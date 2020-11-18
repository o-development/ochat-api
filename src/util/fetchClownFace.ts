import cf, { AnyPointer } from "clownface";
import { NamedNode } from "rdf-js";
import { dataset as Dataset, namedNode } from "@rdfjs/dataset";
import ParserN3 from "@rdfjs/parser-n3";
import { Readable } from "stream";
import IFetcher from "../util/IFetcher";
import nodeFetch from "node-fetch";
import DatasetCore from "@rdfjs/dataset/DatasetCore";
import { rdfType } from "./nodes";
import HttpError from "./HttpError";
import Clownface from "clownface/lib/Clownface";

export async function fetchClownfaceDataset(
  url: string,
  // There's some typing error with this that I can't be bothered to fix at the moment
  // As long as you don't use the "Request" from "RequestInfo" you're fine - Jackson
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  fetcher: IFetcher = nodeFetch
): Promise<Clownface> {
  const fetchResult = await fetcher(url);
  if (!fetchResult.ok) {
    throw new HttpError(fetchResult.statusText, fetchResult.status);
  }
  const ttl = await fetchResult.text();

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

  const cfDataset = cf({ dataset });
  return cfDataset;
}

export default async function fetchClownface(
  url: string,
  types: NamedNode[],
  fetcher?: IFetcher,
  options?: {
    requireAllTypes: boolean;
  }
): Promise<AnyPointer> {
  const requireAllTypes = options?.requireAllTypes;

  const cfDataset = await fetchClownfaceDataset(url, fetcher);
  let node = cfDataset.namedNode(namedNode(url));

  // Check to see if the profile node is really a profile
  const nodeTypeValues = node.out(rdfType).values;
  if (
    types.length > 0 &&
    (requireAllTypes
      ? !types.every((type) => nodeTypeValues.includes(type.value))
      : !types.some((type) => nodeTypeValues.includes(type.value)))
  ) {
    // Check to see if there is a node that has the proper values
    let possibleNodes = cfDataset.has(rdfType, types).values;
    if (!requireAllTypes) {
      types.forEach((type) => {
        possibleNodes = possibleNodes.concat(
          cfDataset.has(rdfType, type).values
        );
      });
    }
    if (possibleNodes.length > 0) {
      node = cfDataset.namedNode(namedNode(possibleNodes[0]));
    } else {
      throw new HttpError(
        `"${url}" does not contain the type(s): ${types
          .map((type) => type.value)
          .join(", ")}`,
        400
      );
    }
  }

  return node;
}