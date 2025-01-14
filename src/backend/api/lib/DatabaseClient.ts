import pg, { PoolClient, PoolConfig, QueryResult } from "pg";

import { env } from "../Env.js";
import type { TDatabaseClient } from "../types/Database.js";

class PostgressClient implements TDatabaseClient {
  private connectionPool: pg.Pool;

  private constructor(connectionPool: pg.Pool) {
    this.connectionPool = connectionPool;
  }

  static async create(connString: string) {
    const pool = new pg.Pool({
      connectionString: connString,
    });

    return new PostgressClient(pool);
  }

  async executeQuery<T extends {}>(
    query: string,
    values?: unknown[],
    poolClient?: PoolClient,
  ): Promise<QueryResult<T>> {
    console.log(
      `Executing: ${query.replaceAll("\n", " ").replaceAll(/\s+/g, " ").trim()}`,
    );

    if (poolClient) {
      return poolClient.query<T>(query, values);
    }
    return this.connectionPool.query<T>(query, values);
  }

  async withTransaction<T>(
    fun: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    const client = await this.connectionPool.connect();
    await this.executeQuery("BEGIN", undefined, client);
    try {
      const res = await fun(client);
      await this.executeQuery("COMMIT", undefined, client);
      return res;
    } catch (e) {
      await this.executeQuery("ROLLBACK", undefined, client);
      throw e;
    } finally {
      client.release();
    }
  }
}

const dbClient: TDatabaseClient = await PostgressClient.create(
  env.dbConnString,
);

export { dbClient as DatabaseClient };
