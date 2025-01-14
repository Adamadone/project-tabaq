import { PoolClient, QueryResult } from "pg";
import { DatabaseClient } from "../lib/DatabaseClient.js";
import { Tag, TDatabaseClient } from "../types/Database.js";

class TagsDao {
  private databaseClient: TDatabaseClient;

  constructor(databaseClient: TDatabaseClient) {
    this.databaseClient = databaseClient;
  }

  async getExistingTagsByName(names: string[]): Promise<Tag[]> {
    const res = await this.databaseClient.executeQuery<Tag>(
      `
        SELECT * FROM "Tags"
        WHERE "name" = ANY ($1)
      `,
      [names],
    );

    return res.rows;
  }

  async createTags(
    tags: Omit<Tag, "id">[],
    client?: PoolClient,
  ): Promise<Tag[]> {
    if (tags.length === 0) return [];

    const values = tags.map((_, index) => `($${index + 1})`).join(", ");
    const res = await this.databaseClient.executeQuery<Tag>(
      `
        INSERT INTO "Tags"
        ("name")
        VALUES ${values}
        RETURNING *
      `,
      tags.map((tag) => tag.name),
      client,
    );

    return res.rows;
  }

  async search(params: {
    nameContains?: string;
    limit: number;
    cursor?: { lastId: number };
  }): Promise<Tag[]> {
    let res: QueryResult<Tag> | undefined;

    let whereClause = ` WHERE "id" > ${params.cursor?.lastId ?? 0} `;

    if (!!params.nameContains?.trim()) {
      whereClause += ` AND "name" ILIKE '%${params.nameContains}%' `;
    }

    res = await this.databaseClient.executeQuery<Tag>(
      `
          SELECT * from "Tags"
          ${whereClause} 
          ORDER BY "id" ASC
          LIMIT $1
        `,
      [params.limit],
    );

    return res.rows;
  }

  async getByProductId(productId: number, client?: PoolClient): Promise<Tag[]> {
    const res = await this.databaseClient.executeQuery<Tag>(
      `
        SELECT * FROM "Tags"
        WHERE "id" in (
          SELECT "tagId" FROM "ProductsTags"
          WHERE "productId" = $1
        )
      `,
      [productId],
      client,
    );

    return res.rows;
  }
}

export const tagsDao = new TagsDao(DatabaseClient);
