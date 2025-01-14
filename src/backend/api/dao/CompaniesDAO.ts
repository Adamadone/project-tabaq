import { Company, TDatabaseClient } from "../types/Database.js";
import { DatabaseClient } from "../lib/DatabaseClient.js";
import { TSortingOrder } from "../types/DAO.js";
import { PoolClient } from "pg";

class CompaniesDao {
  private readonly databaseClient: TDatabaseClient;

  constructor(databaseClient: TDatabaseClient) {
    this.databaseClient = databaseClient;
  }

  async get(id: number, client?: PoolClient): Promise<Company | undefined> {
    const result = await this.databaseClient.executeQuery<Company>(
      `SELECT * FROM "Companies" WHERE "id" = $1`,
      [id],
      client,
    );
    return result.rows[0];
  }

  async getCompanyCount(): Promise<number> {
    const result = await this.databaseClient.executeQuery<{ count: string }>(
      'SELECT COUNT("id") FROM "Companies"',
    );
    return Number.parseInt(result.rows[0].count);
  }

  async createCompany(company: Omit<Company, "id">): Promise<Company> {
    const result = await this.databaseClient.executeQuery<Company>(
      'INSERT INTO "Companies"("name", "imageName", "description") VALUES ($1, $2, $3) RETURNING *',
      [company.name, company.imageName, company.description],
    );
    return result.rows[0];
  }

  async updateCompanyById(company: Company): Promise<Company> {
    const result = await this.databaseClient.executeQuery<Company>(
      'UPDATE "Companies" SET "name"=$1, "imageName"=$2, "description"=$3 WHERE "id"=$4 RETURNING *',
      [company.name, company.imageName, company.description, company.id],
    );
    return result.rows[0];
  }

  async searchCompanies(
    resultCount: number,
    sortOrder: TSortingOrder = "asc",
    cursorId?: number,
  ): Promise<Company[]> {
    const whereClause =
      sortOrder === "asc"
        ? `WHERE "id" > ${cursorId ? cursorId : 0}`
        : `WHERE "id" < ${cursorId ? cursorId : (await this.getCompanyCount()) + 1}`;

    const orderByClause = `ORDER BY "id" ${sortOrder.toUpperCase()}`;
    const limitClause = `LIMIT $1`;
    const values = [resultCount];

    const result = await this.databaseClient.executeQuery<Company>(
      `SELECT * FROM "Companies" ${whereClause} ${orderByClause} ${limitClause}`,
      values,
    );
    return result.rows;
  }

  async deleteCompanyById(id: number, client?: PoolClient): Promise<void> {
    await this.databaseClient.executeQuery(
      'DELETE FROM "Companies" WHERE "id"=$1',
      [id],
    );
  }

  async doesHaveProducts(companyId: number, client?: PoolClient) {
    const res = await this.databaseClient.executeQuery<{ count: string }>(
      `
        SELECT COUNT(*) FROM "Products"
          WHERE "companyId" = $1
      `,
      [companyId],
      client,
    );

    return +res.rows[0].count !== 0;
  }
}

export const companiesDao = new CompaniesDao(DatabaseClient);
