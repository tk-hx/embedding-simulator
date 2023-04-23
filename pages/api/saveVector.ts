// pages/api/saveVector.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { MongoDbClient, MongoConfig } from "../../lib/mongoDbClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const { mongoUri, mongoDbName, embeddingData } = req.body;

  const mongoConfig: MongoConfig = {
    uri: mongoUri,
    dbName: mongoDbName,
  };

  const mongoDbClient = new MongoDbClient(mongoConfig);

  try {
    await mongoDbClient.connect();
    await mongoDbClient.insertOne("vectors", embeddingData);
    res.status(200).json({ message: "Vector saved to the database." });
  } catch (error) {
    res.status(500).json({ message: "Error saving vector to the database." });
    console.error(error);
  } finally {
    await mongoDbClient.disconnect();
  }
}
