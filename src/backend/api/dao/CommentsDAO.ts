import pg, { PoolClient } from "pg";

import { Comment, TDatabaseClient } from "../types/Database.js";
import { DatabaseClient } from "../lib/DatabaseClient.js";
import { TSortingOrder } from "../types/DAO.js";

const { escapeIdentifier } = pg;

export type TCommentsFilter = "id" | "createdAt" | "updatedAt";

export type TCommentsCursor = {
  id?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

class CommentsDAO {
  private readonly databaseClient: TDatabaseClient;

  constructor(databaseClient: TDatabaseClient) {
    this.databaseClient = databaseClient;
  }

  async getCommentById(commentId: number): Promise<Comment | undefined> {
    const queryResult = await this.databaseClient.executeQuery<Comment>(
      `
                SELECT * FROM "Comments" WHERE "id" = $1
            `,
      [commentId],
    );

    if (queryResult.rowCount !== null && queryResult.rowCount > 0) {
      return queryResult.rows[0];
    }

    return undefined;
  }

  async deleteComment(commentId: number): Promise<void> {
    await this.databaseClient.executeQuery<Comment>(
      `
                DELETE FROM "Comments" WHERE "id" = $1
            `,
      [commentId],
    );
  }

  async deleteAllCommentsForReview(
    reviewId: number,
    client?: PoolClient,
  ): Promise<void> {
    await this.databaseClient.executeQuery(
      'DELETE FROM "Comments" WHERE "reviewId" = $1',
      [reviewId],
      client,
    );
  }

  async createComment(
    reviewId: number,
    userId: number,
    comment: string,
  ): Promise<Comment> {
    const now = new Date();

    const queryResult = await this.databaseClient.executeQuery<Comment>(
      `INSERT INTO "Comments" ("reviewId", "userId", "comment", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [reviewId, userId, comment, now, now],
    );

    return queryResult.rows[0];
  }

  async updateComment(
    comment: Pick<Comment, "id" | "comment">,
  ): Promise<Comment> {
    const now = new Date();

    const queryResult = await this.databaseClient.executeQuery<Comment>(
      `
                UPDATE "Comments"
                SET "comment" = $1, "updatedAt" = $2
                WHERE "id" = $3
                RETURNING *
            `,
      [comment.comment, now, comment.id],
    );

    return queryResult.rows[0];
  }

  async getCommentsForReview(
    reviewId: number,
    filter: TCommentsFilter,
    sortingOrder: TSortingOrder,
    limit: number,
    cursor?: TCommentsCursor,
  ): Promise<Comment[]> {
    if (!cursor) {
      const queryResult = await this.databaseClient.executeQuery<Comment>(
        `
                    SELECT * FROM "Comments"
                    WHERE "reviewId" = $1
                    ORDER BY ${escapeIdentifier(filter)} ${sortingOrder.toUpperCase()}
                    LIMIT $2
                `,
        [reviewId, limit],
      );

      return queryResult.rows;
    }

    const {
      values: cursorValues,
      whereClause: cursorWhereClause,
      lastPlaceholderIndex,
    } = constructWhereClauseArtifactWithPlaceholders(cursor, sortingOrder, 2);

    const queryResult = await this.databaseClient.executeQuery<Comment>(
      `
                SELECT * FROM "Comments"
                WHERE "reviewId" = $1 AND ${cursorWhereClause}
                ORDER BY ${escapeIdentifier(filter)} ${sortingOrder.toUpperCase()}
                LIMIT $${lastPlaceholderIndex + 1}
            `,
      [reviewId, ...cursorValues, limit],
    );

    return queryResult.rows;
  }
}

function constructWhereClauseArtifactWithPlaceholders(
  cursor: TCommentsCursor,
  sortingOrder: TSortingOrder,
  placeholderStartIndex: number,
): { whereClause: string; values: unknown[]; lastPlaceholderIndex: number } {
  const whereClauseExpressions: string[] = [];
  const whereClausePlaceholderValues: unknown[] = [];

  Object.entries(cursor).forEach((cursorAttribute) => {
    whereClauseExpressions.push(
      constructClauseExpression(
        cursorAttribute[0],
        sortingOrder,
        placeholderStartIndex + whereClauseExpressions.length,
      ),
    );
    whereClausePlaceholderValues.push(cursorAttribute[1]);
  });

  return {
    whereClause: whereClauseExpressions.join(" AND "),
    values: whereClausePlaceholderValues,
    lastPlaceholderIndex:
      placeholderStartIndex + whereClausePlaceholderValues.length - 1,
  };
}

function constructClauseExpression(
  attributeName: string,
  sortingOrder: TSortingOrder,
  placeholder: number,
): string {
  const sortingIdenntifier = sortingOrder === "asc" ? ">" : "<";

  return `${escapeIdentifier(attributeName)} ${sortingIdenntifier} $${placeholder}`;
}

const commentsDAO = new CommentsDAO(DatabaseClient);

export { commentsDAO };
