-- Up Migration
CREATE TYPE "role" AS ENUM ('Admin', 'User');

CREATE TABLE "Users"(
  "id" SERIAL PRIMARY KEY,
  "externalUserIdentifier" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255),
  "role" role NOT NULL
);

CREATE TABLE "Companies"(
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "imageName" VARCHAR(255)
);

CREATE TABLE "Tags"(
   "id" SERIAL PRIMARY KEY,
   "name" VARCHAR(255) UNIQUE NOT NULL 
);

CREATE TABLE "Products"(
  "id" SERIAL PRIMARY KEY,
  "title" VARCHAR(255) NOT NULL,
  "description" VARCHAR(1024),
  "companyId" INT REFERENCES "Companies"("id") NOT NULL,
  "imageName" VARCHAR(255)
);

CREATE TABLE "ProductsTags"(
  "id" SERIAL PRIMARY KEY,
  "tagId" INT REFERENCES "Tags"("id") NOT NULL,
  "productId" INT REFERENCES "Products"("id") NOT NULL,
  UNIQUE("tagId", "productId")
);



-- Down Migration

DROP TABLE "ProductsTags";
DROP TABLE "Products";
DROP TABLE "Tags";
DROP Table "Companies";
DROP TABLE "Users";
DROP TYPE "role";
