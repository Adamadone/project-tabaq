-- Up Migration
    CREATE TABLE "Reviews" (
    "id" SERIAL PRIMARY KEY,
    "rating" INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    "comment" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "userId" INT REFERENCES "Users"("id") NOT NULL,
    "productId" INT REFERENCES "Products"("id") NOT NULL,
      UNIQUE ("userId", "productId")
        );

-- Down Migration
DROP TABLE "Reviews";