import { namedNode } from "@rdfjs/dataset";

export const rdfType = namedNode(
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
);
export const SchemaPerson = namedNode("http://schema.org/Person");
export const FoafPerson = namedNode("http://xmlns.com/foaf/0.1/Person");
export const vcardImage = namedNode("http://www.w3.org/2006/vcard/ns#hasPhoto");
export const foafImage = namedNode("http://xmlns.com/foaf/0.1/img");
export const vcardName = namedNode("http://www.w3.org/2006/vcard/ns#fn");
export const foafName = namedNode("http://xmlns.com/foaf/0.1/name");
