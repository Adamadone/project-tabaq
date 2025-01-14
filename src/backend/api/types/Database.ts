import { PoolClient, QueryResult, QueryResultRow } from "pg";

export type TDatabaseClient = {
  executeQuery<T extends QueryResultRow>(
    query: string,
    values?: unknown[],
    client?: PoolClient,
  ): Promise<QueryResult<T>>;
  withTransaction<T>(fun: (client: PoolClient) => Promise<T>): Promise<T>;
};

export type User = {
  id: number;
  externalUserIdentifier: string;
  name: string;
  role: TRole;
};

export type Role = {
  id: number;
  role: string;
};

export type TRole = "User" | "Admin";

export type Product = {
  id: number;
  title: string;
  description?: string;
  companyId: number;
  imageName?: string;
  averageRating: number;
};

export type Tag = {
  id: number;
  name: string;
};

export type Company = {
  id: number;
  name: string;
  imageName?: string;
  description?: string;
};

export type Review = {
  id: number;
  userId: User["id"];
  productId: Product["id"];
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Comment = {
  id: number;
  reviewId: number;
  userId: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
};
