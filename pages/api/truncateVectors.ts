// pages/api/truncateVectors.ts

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
    await mongoDbClient.truncate("vectors");
    res.status(200).json({ message: "Vectors truncated from the database." });
  } catch (error) {
    res.status(500).json({ message: "Error while truncating vectors." });
    console.error(error);
  } finally {
    await mongoDbClient.disconnect();
  }
}
