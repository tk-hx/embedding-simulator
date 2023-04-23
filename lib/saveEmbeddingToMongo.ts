// lib/saveEmbeddingToMongo.ts

import { EmbeddingData } from "./openAi";
import { MongoDbClient, MongoConfig } from "./mongoDbClient";

export async function saveEmbeddingToMongo(
  embeddingData: EmbeddingData,
  mongoConfig: MongoConfig,
  collectionName: string = "embeddings"
): Promise<void> {
  const mongoClient = new MongoDbClient(mongoConfig);
  await mongoClient.connect();
  await mongoClient.insertOne(collectionName, embeddingData);
  await mongoClient.disconnect();
}
