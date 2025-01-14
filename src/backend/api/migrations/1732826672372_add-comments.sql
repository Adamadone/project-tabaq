
-- Up Migration

CREATE table "Comments" (
	"id" SERIAL PRIMARY KEY,
    "reviewId" INT REFERENCES "Reviews"("id") NOT NULL,
	"userId" INT REFERENCES "Users"("id") NOT NULL,
	"comment" VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);


-- Down Migration

DROP TABLE "Comments"