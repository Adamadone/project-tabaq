import { Review, TDatabaseClient } from "../types/Database.js";
import { DatabaseClient } from "../lib/DatabaseClient.js";
import { PoolClient } from "pg";
import { commentsDAO } from "./CommentsDAO.js";

class ReviewsDAO {
  private readonly databaseClient: TDatabaseClient;

  constructor(databaseClient: TDatabaseClient) {
    this.databaseClient = databaseClient;
  }

  async createReview(
    review: Pick<Review, "userId" | "productId" | "rating" | "comment">,
  ): Promise<Review> {
    const result = await this.databaseClient.executeQuery<Review>(
      `
        INSERT INTO "Reviews" ("userId", "productId", "rating", "comment", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING *
      `,
      [review.userId, review.productId, review.rating, review.comment || ""],
    );

    return result.rows[0];
  }

  async updateReview(
    review: Pick<Review, "id" | "rating" | "comment">,
  ): Promise<Review> {
    const result = await this.databaseClient.executeQuery<Review>(
      `
        UPDATE "Reviews"
        SET "rating"=$2, "comment"=$3, "updatedAt"=NOW()
        WHERE "id"=$1
        RETURNING *
      `,
      [review.id, review.rating, review.comment || ""],
    );

    return result.rows[0];
  }

  async deleteReview(id: number, client?: PoolClient): Promise<void> {
    await this.databaseClient.executeQuery(
      'DELETE FROM "Reviews" WHERE "id" = $1',
      [id],
      client,
    );
  }

  async deleteReviewAndComments(reviewId: number): Promise<void> {
    await this.databaseClient.withTransaction(async (client) => {
      await commentsDAO.deleteAllCommentsForReview(reviewId, client);
      await this.deleteReview(reviewId, client);
    });
  }

  async getReviewByUserId(
    userId: number,
    limit: number,
    cursor?: { id: number },
  ): Promise<Review[]> {
    const whereConditions = ['"userId" = $1'];
    const params: any[] = [userId];
    let cursorCondition = "";

    if (cursor && cursor.id) {
      params.push(cursor.id);
      cursorCondition = `AND "id" > $${params.length}`;
    }

    const query = `
      SELECT * FROM "Reviews"
      WHERE ${whereConditions.join(" AND ")} ${cursorCondition}
      ORDER BY "id" ASC
      LIMIT $${params.length + 1}
    `;

    params.push(limit + 1);

    const result = await this.databaseClient.executeQuery<Review>(
      query,
      params,
    );

    return result.rows;
  }

  async getReviewByProductId(
    productId: number,
    cursor: number | null,
    limit: number,
  ): Promise<Review[]> {
    const query = cursor
      ? 'SELECT * FROM "Reviews" WHERE "productId"=$1 AND "id" > $2 ORDER BY "id" ASC LIMIT $3'
      : 'SELECT * FROM "Reviews" WHERE "productId"=$1 ORDER BY "id" ASC LIMIT $2';

    const params = cursor ? [productId, cursor, limit] : [productId, limit];

    const result = await this.databaseClient.executeQuery<Review>(
      query,
      params,
    );

    return result.rows;
  }

  async getReviewByIdAndUserId(
    reviewId: number,
    userId: number,
  ): Promise<Review | null> {
    const result = await this.databaseClient.executeQuery<Review>(
      'SELECT * FROM "Reviews" WHERE "id" = $1 AND "userId" = $2',
      [reviewId, userId],
    );

    return result.rows[0] || null;
  }

  async getReviewByUserIdAndProductId(
    userId: number,
    productId: number,
  ): Promise<Review | null> {
    const result = await this.databaseClient.executeQuery<Review>(
      'SELECT * FROM "Reviews" WHERE "userId" = $1 AND "productId" = $2',
      [userId, productId],
    );

    return result.rows[0];
  }
}

export const reviewsDAO = new ReviewsDAO(DatabaseClient);
