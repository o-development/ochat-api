import { namedNode } from "@rdfjs/dataset";

export const rdfType = namedNode(
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
);

// Profile Types
export const SchemaPerson = namedNode("http://schema.org/Person");
export const FoafPerson = namedNode("http://xmlns.com/foaf/0.1/Person");
export const vcardImage = namedNode("http://www.w3.org/2006/vcard/ns#hasPhoto");
export const foafImage = namedNode("http://xmlns.com/foaf/0.1/img");
export const vcardName = namedNode("http://www.w3.org/2006/vcard/ns#fn");
export const foafName = namedNode("http://xmlns.com/foaf/0.1/name");

// Chat Types
export const author = namedNode("http://purl.org/dc/elements/1.1/author");
export const dateCreatedElements = namedNode(
  "http://purl.org/dc/elements/1.1/created"
);
export const title = namedNode("http://purl.org/dc/elements/1.1/title");
export const participation = namedNode(
  "http://www.w3.org/2005/01/wf/flow#participation"
);
export const sharedPreferences = namedNode(
  "http://www.w3.org/ns/ui#sharedPreferences"
);
export const LongChat = namedNode("http://www.w3.org/ns/pim/meeting#LongChat");
export const ShortChat = namedNode("http://www.w3.org/ns/pim/meeting#Chat");
export const dateStart = namedNode(
  "http://www.w3.org/2002/12/cal/ical#dtstart"
);
export const participant = namedNode(
  "http://www.w3.org/2005/01/wf/flow#participant"
);
export const backgroundColor = namedNode(
  "http://www.w3.org/ns/ui#backgroundColor"
);
export const messgae = namedNode("http://www.w3.org/2005/01/wf/flow#message");
export const dateCreatedTerms = namedNode("http://purl.org/dc/terms/created");
export const content = namedNode("http://rdfs.org/sioc/ns#content");
export const maker = namedNode("http://xmlns.com/foaf/0.1/maker");

// LDP types
export const container = namedNode("http://www.w3.org/ns/ldp#Container");
export const basicContainer = namedNode(
  "http://www.w3.org/ns/ldp#BasicContainer"
);
export const contains = namedNode("http://www.w3.org/ns/ldp#contains");
export const flowMessage = namedNode(
  "http://www.w3.org/2005/01/wf/flow#message"
);

// Literal Types
export const xslDateTime = namedNode(
  "http://www.w3.org/2001/XMLSchema#dateTime"
);
