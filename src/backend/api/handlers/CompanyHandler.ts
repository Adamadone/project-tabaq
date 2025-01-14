import { Handler, Request, Response } from "express";
import { z } from "zod";
import { companiesDao } from "../dao/CompaniesDAO.js";
import { TFilterResult } from "../types/Filter.js";
import { Company, TDatabaseClient } from "../types/Database.js";
import { base64UrlDecode, base64UrlEncode } from "../lib/Base64Helper.js";
import { DatabaseClient } from "../lib/DatabaseClient.js";
import { productsTagsDao } from "../dao/ProductsTagsDao.js";
import { productsDAO } from "../dao/ProductsDAO.js";

const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  imageName: z.string().optional(),
  description: z.string().optional(),
});
const cursorValidator = z.object({
  id: z.number(),
});

class CompanyHandler {
  private databaseClient: TDatabaseClient;

  constructor(databaseClient: TDatabaseClient) {
    this.databaseClient = databaseClient;
  }

  async getCompanyById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).send({ error: "Invalid company ID" });
        return;
      }
      const company = await companiesDao.get(id);
      if (!company) {
        res.status(404).send({ error: "Company not found" });
        return;
      }
      res.status(200).send(company);
    } catch (error) {
      res.status(500).send({ error: "Internal server error" });
    }
  }

  async searchCompanies(req: Request, res: Response): Promise<void> {
    try {
      const querySchema = z.object({
        resultCount: z.coerce.number().default(10),
        order: z.enum(["desc", "asc"]).default("asc"),
        cursor: z.string().optional(),
      });
      const query = querySchema.parse(req.query);
      const decodedCursor = query.cursor
        ? cursorValidator.parse(JSON.parse(base64UrlDecode(query.cursor)))
        : undefined;

      const companies = await companiesDao.searchCompanies(
        query.resultCount + 1,
        query.order,
        decodedCursor?.id,
      );

      const hasNextPage = companies.length > query.resultCount;
      const responseBody: TFilterResult<Company> = {
        cursor: hasNextPage
          ? base64UrlEncode(JSON.stringify({ id: companies.at(-2)?.id }))
          : undefined,
        hasNextPage,
        results: companies.slice(0, query.resultCount),
      };
      res.status(200).json(responseBody);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: (error as Error).message });
      }
    }
  }

  async createCompany(req: Request, res: Response): Promise<void> {
    try {
      const company = companySchema.parse(req.body);
      const newCompany = await companiesDao.createCompany(company);
      res.status(201).json(newCompany);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: (error as Error).message });
      }
    }
  }

  async updateCompany(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const companyData = companySchema.parse(req.body);
      const updatedCompany = await companiesDao.updateCompanyById({
        id: Number(id),
        ...companyData,
      });
      res.status(200).json(updatedCompany);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: (error as Error).message });
      }
    }
  }

  deleteCompany: Handler = async (req, res): Promise<void> => {
    const id = +req.params.id;
    try {
      const transactionResult = await this.databaseClient.withTransaction(
        async (client) => {
          const company = await companiesDao.get(id, client);
          if (!company)
            return {
              ok: false as const,
              error: "COMPANY_DOES_NOT_EXIST",
            };

          const doesHaveProducts = await companiesDao.doesHaveProducts(
            company.id,
            client,
          );
          if (doesHaveProducts)
            return {
              ok: false as const,
              error: "HAS_PRODUCTS",
            };

          await companiesDao.deleteCompanyById(Number(id), client);
          return {
            ok: true as const,
          };
        },
      );

      if (!transactionResult.ok) {
        res.status(400).json(transactionResult.error);
        return;
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
}

export const companyHandler = new CompanyHandler(DatabaseClient);
