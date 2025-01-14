import { DatabaseClient } from "../lib/DatabaseClient.js";
import { TSortingOrder } from "../types/DAO.js";
import { TDatabaseClient, TRole } from "../types/Database";
import { User } from "../types/Database";

class UsersDAO {
  private readonly databaseClient: TDatabaseClient;

  constructor(databaseClient: TDatabaseClient) {
    this.databaseClient = databaseClient;
  }

  async getUserCount(): Promise<number> {
    const result = await this.databaseClient.executeQuery<{ count: string }>(
      'SELECT COUNT("id") FROM "Users"',
    );

    return Number.parseInt(result.rows[0].count);
  }

  async createUser(user: Omit<User, "id">): Promise<User> {
    const result = await this.databaseClient.executeQuery<User>(
      'INSERT INTO "Users"("externalUserIdentifier", "name", "role") VALUES ($1, $2, $3) RETURNING *',
      [user.externalUserIdentifier, user.name, user.role],
    );

    return result.rows[0];
  }

  async getUserById(id: number): Promise<User | undefined> {
    const result = await this.databaseClient.executeQuery<User>(
      'SELECT * FROM "Users" WHERE "id"=$1',
      [id],
    );

    if (!result.rows[0]) return;

    return result.rows[0];
  }

  async getUserByExternalId(externalUserId: string): Promise<User | undefined> {
    const result = await this.databaseClient.executeQuery<User>(
      'SELECT * FROM "Users" WHERE "externalUserIdentifier"=$1',
      [externalUserId],
    );

    if (!result.rows[0]) return;

    return result.rows[0];
  }

  async updateUserById(
    id: number,
    user: Omit<User, "id" | "externalUserIdentifier">,
  ): Promise<User> {
    const result = await this.databaseClient.executeQuery<User>(
      `
            UPDATE "Users" SET "name"=$1, "role"=$2 WHERE "id"=$3 RETURNING *`,
      [user.name, user.role, id],
    );

    return result.rows[0];
  }

  async getUserCountByRole(role: TRole): Promise<number> {
    const result = await this.databaseClient.executeQuery<{ count: string }>(
      'SELECT COUNT("id") from "Users" WHERE "role"=$1',
      [role],
    );

    return Number.parseInt(result.rows[0].count);
  }

  async searchUsers(
    resultCount: number,
    sortOrder: TSortingOrder,
    userCursor?: { id: number } | undefined,
  ): Promise<User[]> {
    let whereClause: string | undefined;
    let orderByClause: string | undefined;

    if (sortOrder === "asc") {
      whereClause = `WHERE "id" > ${userCursor ? userCursor.id : 0}`;
    } else {
      whereClause = `WHERE "id" < ${userCursor ? userCursor.id : (await this.getUserCount()) + 1}`;
    }

    if (sortOrder === "asc") {
      orderByClause = 'ORDER BY "id" ASC';
    } else {
      orderByClause = 'ORDER BY "id" DESC';
    }

    const result = await this.databaseClient.executeQuery<User>(
      `SELECT * from "Users" ${whereClause} ${orderByClause} LIMIT $1`,
      [resultCount],
    );

    return result.rows;
  }
}

const usersDAO = new UsersDAO(DatabaseClient);

export { usersDAO as UsersDAO };
