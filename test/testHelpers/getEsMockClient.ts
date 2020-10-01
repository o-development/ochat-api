import { Client } from "@elastic/elasticsearch";
import Mock from "@elastic/elasticsearch-mock";

export default function getEsMockClikent(): Client {
  const mock = new Mock();
  const client = new Client({
    node: "http://localhost:9200",
    Connection: mock.getConnection(),
  });
  return client;
}
