import { Client } from "@elastic/elasticsearch";
const esClient = new Client({ node: "http://localhost:9200" });
export default esClient;
