// lib/mongoDbClient.ts

import { MongoClient, Db, Collection, InsertOneResult } from "mongodb";

interface MongoConfig {
  uri: string;
  dbName: string;
}

class MongoDbClient {
  private client: MongoClient;
  private dbName: string;

  constructor(config: MongoConfig) {
    this.client = new MongoClient(config.uri);
    this.dbName = config.dbName;
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    await this.client.close();
  }

  getDb(): Db {
    return this.client.db(this.dbName);
  }

  getCollection(collectionName: string): Collection {
    return this.getDb().collection(collectionName);
  }

  async insertOne(
    collectionName: string,
    document: any
  ): Promise<InsertOneResult<any>> {
    const collection = this.getCollection(collectionName);
    return await collection.insertOne(document);
  }

  async find(collectionName: string, query: any): Promise<any[]> {
    const collection = this.getCollection(collectionName);
    return await collection.find(query).toArray();
  }
}

export type { MongoConfig };
export { MongoDbClient };
