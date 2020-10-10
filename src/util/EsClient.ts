import { Client } from "@elastic/elasticsearch";

const endpoint = process.env.ES_ENDPOINT;

const EsClient = new Client({
  node: endpoint,
});
export default EsClient;
