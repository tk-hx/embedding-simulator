// pages/api/getVectorsCount.ts

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

  const { mongoUri, mongoDbName } = req.body;

  const mongoConfig: MongoConfig = {
    uri: mongoUri,
    dbName: mongoDbName,
  };

  let mongoDbClient: MongoDbClient;
  try {
    mongoDbClient = new MongoDbClient(mongoConfig);
  } catch (error) {
    res.status(200).json({ count: -1 });
    return;
  }

  try {
    await mongoDbClient.connect();
    const count = await mongoDbClient.getCollectionCount("vectors");
    res.status(200).json({ count: count });
  } catch (error) {
    res.status(200).json({ count: -1 });
  } finally {
    await mongoDbClient.disconnect();
  }
}
