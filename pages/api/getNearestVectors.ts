import { NextApiRequest, NextApiResponse } from "next";
import { MongoDbClient, MongoConfig } from "../../lib/mongoDbClient";

const vectorCollection = "vectors";

async function getNearestVectors(
  config: MongoConfig,
  inputVector: number[],
  limit: number
) {
  const client = new MongoDbClient(config);
  await client.connect();

  const collection = client.getCollection(vectorCollection);
  const pipeline = [
    {
      $addFields: {
        distance: {
          $sqrt: {
            $reduce: {
              input: { $range: [0, { $size: "$vector" }] },
              initialValue: 0,
              in: {
                $add: [
                  "$$value",
                  {
                    $pow: [
                      {
                        $subtract: [
                          { $arrayElemAt: ["$vector", "$$this"] },
                          { $arrayElemAt: [inputVector, "$$this"] },
                        ],
                      },
                      2,
                    ],
                  },
                ],
              },
            },
          },
        },
      },
    },
    { $sort: { distance: 1 } },
    { $limit: limit },
  ];

  const result = await collection.aggregate(pipeline).toArray();
  await client.disconnect();
  return result;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { mongoUri, mongoDbName, inputVector, limit } = req.body;

  if (
    typeof mongoUri !== "string" ||
    typeof mongoDbName !== "string" ||
    !Array.isArray(inputVector) ||
    typeof limit !== "number"
  ) {
    res
      .status(400)
      .json({ error: "Invalid mongoUri, mongoDbName, inputVector or limit." });
    return;
  }

  const config: MongoConfig = {
    uri: mongoUri,
    dbName: mongoDbName,
  };

  try {
    const nearestVectors = await getNearestVectors(config, inputVector, limit);
    res.status(200).json(nearestVectors);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching the nearest vectors." });
  }
}
