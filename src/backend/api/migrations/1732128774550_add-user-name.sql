-- Up Migration
ALTER TABLE "Users" DROP COLUMN "email";
ALTER TABLE "Users" ADD COLUMN "name" VARCHAR(255); 
UPDATE "Users" SET "name"='';
ALTER TABLE "Users" ALTER COLUMN "name" SET NOT NULL;

-- Down Migration
ALTER TABLE "Users" DROP COLUMN "name";
ALTER TABLE "Users" ADD COLUMN "email" VARCHAR(255);