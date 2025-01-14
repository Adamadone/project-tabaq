import { RequestHandler } from "express";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import { z } from "zod";
import { productsDAO } from "../dao/ProductsDAO.js";
import { Product, TDatabaseClient } from "../types/Database.js";
import { DatabaseClient } from "../lib/DatabaseClient.js";
import { tagsDao } from "../dao/TagsDAO.js";
import { productsTagsDao } from "../dao/ProductsTagsDao.js";
import { companiesDao } from "../dao/CompaniesDAO.js";
import { base64UrlDecode, base64UrlEncode } from "../lib/Base64Helper.js";
import { PoolClient } from "pg";
import { UploadedFile } from "express-fileupload";
import { env } from "../Env.js";

const productBodySchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(1024).optional(),
  companyId: z.number(),
  tags: z.array(z.string()),
});

const idSchema = z.object({
  id: z.coerce.number(),
});
const cursorValidator = z.object({
  id: z.number(),
});

const searchProductsParamsSchema = z.object({
  nameContains: z.string().optional(),
  hasTags: z
    .string()
    .transform((v) => v.split(","))
    .pipe(z.array(z.coerce.number().int()))
    .optional(),
  companyId: z.coerce.number().int().optional(),
  minRating: z.coerce.number().optional(),
  maxRating: z.coerce.number().optional(),
  limit: z.coerce.number().default(5),
  resultCount: z.coerce.number().default(10),
  cursor: z.string().optional(),
  order: z.enum(["desc", "asc"]).default("asc"),
});

const getProductsByRatingSchema = z.object({
  limit: z.coerce.number().default(5),
  cursor: z.number().optional(),
  minRating: z.coerce.number().default(1),
  maxRating: z.coerce.number().default(5),
});

class ProductsHandler {
  private databaseClient: TDatabaseClient;

  constructor(databaseClient: TDatabaseClient) {
    this.databaseClient = databaseClient;
  }

  getProductData: RequestHandler = async (req, res) => {
    const paramsValidation = idSchema.safeParse(req.params);
    if (!paramsValidation.success) {
      res.status(400);
      res.json(paramsValidation.error);
      return;
    }
    const params = paramsValidation.data;
    const transactionResult = await this.databaseClient.withTransaction(
      async (client) => {
        const productData = await productsDAO.getProductById(params.id, client);
        if (!productData) {
          return { ok: false as const, error: "Product doesn't exist" };
        }
        const company = await companiesDao.get(productData.companyId, client);
        const tags = await tagsDao.getByProductId(params.id);
        return { ok: true as const, productData, company, tags };
      },
    );
    if (!transactionResult.ok) {
      res.status(400);
      res.json(transactionResult.error);
      return;
    }
    res.json({
      ...transactionResult.productData,
      company: transactionResult.company,
      tags: transactionResult.tags,
    });
  };

  createProduct: RequestHandler = async (req, res) => {
    const bodyValidation = productBodySchema.safeParse(req.body);
    if (!bodyValidation.success) {
      res.status(400);
      res.json(bodyValidation.error);
      return;
    }
    const body = bodyValidation.data;

    try {
      const result = await this.databaseClient.withTransaction(
        async (client) => {
          const company = await companiesDao.get(body.companyId, client);
          if (!company) {
            return { ok: false as const, error: "Company doesn't exist" };
          }

          const product = await productsDAO.create(body, client);
          const tags = await this.createAndLinkTags(
            { product, toBeTags: body.tags },
            client,
          );
          return { ok: true as const, ...product, tags };
        },
      );
      if (!result.ok) {
        res.status(400).json(result.error);
        return;
      }

      const { ok, ...restResult } = result;
      res.status(201).json(restResult);
    } catch (e) {
      res.status(500);
      res.json(e);
    }
  };

  updateProduct: RequestHandler = async (req, res) => {
    const bodyValidation = productBodySchema.safeParse(req.body);
    if (!bodyValidation.success) {
      res.status(400).json(bodyValidation.error);
      return;
    }
    const body = bodyValidation.data;

    const paramsValidation = idSchema.safeParse(req.params);
    if (!paramsValidation.success) {
      res.status(400).json(paramsValidation.error);
      return;
    }
    const params = paramsValidation.data;

    try {
      const result = await this.databaseClient.withTransaction(
        async (client) => {
          const product = await productsDAO.getProductById(params.id, client);
          if (!product) {
            return { ok: false as const, error: "Product doesn't exist" };
          }
          const company = await companiesDao.get(body.companyId, client);
          if (!company) {
            return { ok: false as const, error: "Company doesn't exist" };
          }

          const updatedProduct = await productsDAO.update(
            { ...product, ...body, ...params },
            client,
          );
          const tags = await this.createAndLinkTags(
            { product, toBeTags: body.tags },
            client,
          );
          return { ok: true as const, ...updatedProduct, tags };
        },
      );
      if (!result.ok) {
        res.status(400).json(result.error);
        return;
      }

      const { ok, ...restResult } = result;
      res.status(201).json(restResult);
    } catch (e) {
      res.status(500);
      res.json(e);
    }
  };

  private async createAndLinkTags(
    { product, toBeTags }: { product: Product; toBeTags: string[] },
    client: PoolClient,
  ) {
    const existingTags = await tagsDao.getExistingTagsByName(toBeTags);
    const existingTagsNames = existingTags.map((tag) => tag.name);
    const tagsThatNeedToBeCreated = toBeTags.filter(
      (tag) => !existingTagsNames.includes(tag),
    );

    const createdTags = await tagsDao.createTags(
      tagsThatNeedToBeCreated.map((tag) => ({ name: tag })),
      client,
    );
    const allTags = [...existingTags, ...createdTags];

    await productsTagsDao.unlinkAllTagsForProduct(product.id, client);
    await productsTagsDao.linkProductAndTagBatch(
      allTags.map((tag) => ({ tagId: tag.id, productId: product.id })),
      client,
    );

    return allTags;
  }

  deleteProduct: RequestHandler = async (req, res) => {
    const paramsValidation = idSchema.safeParse(req.params);
    if (!paramsValidation.success) {
      res.status(400);
      res.json(paramsValidation.error);
      return;
    }
    const params = paramsValidation.data;

    try {
      const result = await this.databaseClient.withTransaction(
        async (client) => {
          const product = await productsDAO.getProductById(params.id, client);
          if (!product) {
            return { ok: false as const, error: "Produkt neexistuje" };
          }

          await productsTagsDao.unlinkAllTagsForProduct(params.id, client);
          await productsDAO.delete(params.id, client);
          return { ok: true as const };
        },
      );
      if (!result.ok) {
        res.status(400).json(result.error);
        return;
      }

      res.status(204).send();
    } catch (e) {
      res.status(500);
      res.json(e);
    }
  };

  searchProducts: RequestHandler = async (req, res) => {
    const queryValidation = searchProductsParamsSchema.safeParse(req.query);
    if (!queryValidation.success) {
      res.status(400).json({ error: queryValidation.error });
      return;
    }
    const query = queryValidation.data;

    const decodedCursor = query.cursor
      ? cursorValidator.parse(JSON.parse(base64UrlDecode(query.cursor)))
      : undefined;

    const productsWithAdditionalData =
      await this.databaseClient.withTransaction(async (client) => {
        const products = await productsDAO.searchProducts({
          nameContains: query.nameContains,
          hasTags: query.hasTags,
          companyId: query.companyId,
          minRating: query.minRating,
          maxRating: query.maxRating,
          limit: query.resultCount + 1,
          cursor: decodedCursor?.id,
          sortOrder: query.order,
        });

        return await Promise.all(
          products.map(async (product) => {
            const company = await companiesDao.get(product.companyId, client);
            const tags = await tagsDao.getByProductId(product.id, client);
            return { ...product, company, tags };
          }),
        );
      });

    const hasNextPage = productsWithAdditionalData.length > query.resultCount;
    const responseBody = {
      cursor: hasNextPage
        ? base64UrlEncode(
            JSON.stringify({ id: productsWithAdditionalData.at(-2)?.id }),
          )
        : undefined,
      hasNextPage,
      results: productsWithAdditionalData.slice(0, query.resultCount),
    };

    res.status(200).json(responseBody);
  };

  uploadImage: RequestHandler = async (req, res) => {
    const file = req.files?.file as UploadedFile;
    const productId = req.params.productId;
    if (!file || !productId) {
      res.sendStatus(400);
      return;
    }

    const product = await productsDAO.getProductById(+productId);
    if (!product) {
      res.sendStatus(400);
      return;
    }

    const imageName = `${crypto.randomUUID()}-${file.name}`;
    const updatedProduct: Product = { ...product, imageName };

    file.mv(this.getImagePath(imageName), async (err) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
        return;
      }

      await (async () => {
        try {
          if (product.imageName)
            await fs.unlink(this.getImagePath(product.imageName));
        } catch (e) {
          // The file might be already deleted
        }
      })();
      await productsDAO.update(updatedProduct);

      res.sendStatus(201);
    });
  };

  getImage: RequestHandler = async (req, res) => {
    const productId = req.params.productId;
    if (!productId) {
      res.sendStatus(400);
      return;
    }

    const product = await productsDAO.getProductById(+productId);
    if (!product || !product.imageName) {
      res.sendStatus(404);
      return;
    }

    res.sendFile(this.getImagePath(product.imageName));
  };

  getImagePath = (fileName: string) => path.join(env.imageDir, fileName);
}

export const productsHandler = new ProductsHandler(DatabaseClient);
