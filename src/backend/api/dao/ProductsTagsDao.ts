import { PoolClient } from "pg";
import { DatabaseClient } from "../lib/DatabaseClient.js";
import { Tag, TDatabaseClient } from "../types/Database.js";

class ProductsTagsDao {
  private databaseClient: TDatabaseClient;

  constructor(databaseClient: TDatabaseClient) {
    this.databaseClient = databaseClient;
  }

  async linkProductAndTagBatch(
    items: { productId: number; tagId: number }[],
    client?: PoolClient,
  ) {
    if (items.length === 0) return;

    const valuesPlacholder = items
      .map((_, index) => `($${index * 2 + 1}, $${index * 2 + 2})`)
      .join(", ");
    const values = items.flatMap((item) => [item.productId, item.tagId]);

    await this.databaseClient.executeQuery<Tag>(
      `
        INSERT INTO "ProductsTags"
          ("productId", "tagId")
          VALUES ${valuesPlacholder}
          ON CONFLICT DO NOTHING
      `,
      values,
      client,
    );
  }

  async unlinkAllTagsForProduct(productId: number, client?: PoolClient) {
    return this.databaseClient.executeQuery(
      `
        DELETE FROM "ProductsTags"
        WHERE "productId"=$1
      `,
      [productId],
      client,
    );
  }
}

export const productsTagsDao = new ProductsTagsDao(DatabaseClient);
