import { Product, TDatabaseClient } from "../types/Database.js";

import { DatabaseClient } from "../lib/DatabaseClient.js";
import { TSortingOrder } from "../types/DAO.js";
import { PoolClient } from "pg";
import { joinQuery } from "../lib/DatabaseHelper.js";

class ProductsDAO {
  private readonly databaseClient: TDatabaseClient;

  constructor(databaseClient: TDatabaseClient) {
    this.databaseClient = databaseClient;
  }

  async getProductById(
    id: number,
    client?: PoolClient,
  ): Promise<Product | undefined> {
    const result = await this.databaseClient.executeQuery<Product>(
      `
      SELECT * FROM "Products" WHERE "id"=$1
      `,
      [id],
      client,
    );

    const product = result.rows[0];
    return { ...product, averageRating: +product.averageRating };
  }

  async create(
    product: Omit<Product, "id" | "averageRating">,
    client?: PoolClient,
  ): Promise<Product> {
    const result = await this.databaseClient.executeQuery<Product>(
      `
        INSERT INTO "Products"
        ("title", "description", "companyId", "imageName") 
        VALUES ($1, $2, $3, $4) 
        RETURNING *
      `,
      [
        product.title,
        product.description,
        product.companyId,
        product.imageName,
      ],
      client,
    );

    return result.rows[0];
  }

  async update(product: Product, client?: PoolClient): Promise<Product> {
    const result = await this.databaseClient.executeQuery<Product>(
      `
        UPDATE "Products"
        SET "title"=$2, "description"=$3, "companyId"=$4, "imageName"=$5
        WHERE id=$1
        RETURNING *
      `,
      [
        product.id,
        product.title,
        product.description,
        product.companyId,
        product.imageName,
      ],
      client,
    );

    return result.rows[0];
  }

  async delete(id: number, client: PoolClient): Promise<void> {
    await this.databaseClient.executeQuery(
      `
        DELETE FROM "Comments"
        WHERE "Comments"."reviewId" in (
          SELECT "Reviews"."id" FROM "Reviews"
          WHERE "Reviews"."productId" = $1
        )`,
      [id],
      client,
    );
    await this.databaseClient.executeQuery(
      `DELETE FROM "Reviews" WHERE "productId" = $1`,
      [id],
      client,
    );
    await this.databaseClient.executeQuery(
      `DELETE FROM "Products" WHERE "id"=$1`,
      [id],
      client,
    );
  }

  async searchProducts(
    params: {
      nameContains?: string;
      hasTags?: number[];
      companyId?: number;
      minRating?: number;
      maxRating?: number;
      limit: number;
      cursor?: number;
      sortOrder?: TSortingOrder;
    },
    client?: PoolClient,
  ): Promise<Product[]> {
    const sortOrder = params.sortOrder || "asc";

    const nameContainsVariable =
      params.nameContains && `%${params.nameContains}%`;
    const hasTags = params.hasTags;
    const productCount = await this.getProductCount();

    const joined = joinQuery([
      'SELECT p.* FROM "Products" as p',

      // Joins
      params.hasTags &&
        `LEFT JOIN "ProductsTags" as pt ON pt."productId" = p."id"`,
      params.companyId !== undefined &&
        `LEFT JOIN "Companies" as c ON c."id" = p."companyId"`,

      // Where
      sortOrder === "asc"
        ? (v) => `WHERE p."id" > ${v(params.cursor ? params.cursor : 0)}`
        : (v) =>
            `WHERE p."id" < ${v(params.cursor ? params.cursor : productCount + 1)}`,
      hasTags &&
        ((v) =>
          `AND pt."tagId" in (${hasTags.map((tag) => v(tag)).join(",")})`),
      nameContainsVariable &&
        ((v) => `AND p.title ILIKE ${v(nameContainsVariable)}`),
      params.companyId !== undefined &&
        ((v) => `AND c."id" = ${v(params.companyId)}`),
      params.minRating !== undefined &&
        ((v) => `AND p."averageRating" >= ${v(params.minRating)}`),
      params.maxRating !== undefined &&
        ((v) => `AND p."averageRating" <= ${v(params.maxRating)}`),

      // Final
      `GROUP BY p."id"`,
      hasTags && ((v) => `HAVING COUNT(pt."tagId") >= ${v(hasTags.length)}`),
      `ORDER BY p."id" ${sortOrder.toUpperCase()}`,
      (v) => `LIMIT ${v(params.limit)}`,
    ]);

    const result = await this.databaseClient.executeQuery<Product>(
      joined.query,
      joined.variables,
      client,
    );
    return result.rows.map((product) => ({
      ...product,
      averageRating: +product.averageRating,
    }));
  }

  async getProductCount(): Promise<number> {
    const result = await this.databaseClient.executeQuery<{ count: string }>(
      'SELECT COUNT("id") FROM "Products"',
    );
    return Number.parseInt(result.rows[0].count);
  }
}

export const productsDAO = new ProductsDAO(DatabaseClient);
