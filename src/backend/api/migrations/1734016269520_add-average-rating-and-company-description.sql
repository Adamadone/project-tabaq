-- Up Migration

ALTER TABLE "Products" ADD COLUMN "averageRating" NUMERIC DEFAULT 0;
ALTER TABLE "Companies" ADD COLUMN "description" VARCHAR(1024) DEFAULT '';
CREATE OR REPLACE FUNCTION update_product_average_rating()
RETURNS TRIGGER AS $$
DECLARE
  product_id INTEGER;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    product_id = OLD."productId";
  ELSE
    product_id = NEW."productId";
  END IF;

  UPDATE "Products"
  SET "averageRating" = ROUND(COALESCE((
    SELECT AVG("rating") FROM "Reviews" WHERE "productId" = product_id
    ), 0), 1)
  WHERE "id" = product_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS reviews_after_change ON "Reviews";

CREATE TRIGGER reviews_after_change
AFTER INSERT OR UPDATE OR DELETE ON "Reviews"
FOR EACH ROW
EXECUTE FUNCTION update_product_average_rating();

-- Down Migration

ALTER TABLE "Products" DROP COLUMN "averageRating";
ALTER TABLE "Companies" DROP COLUMN "description";
DROP TRIGGER IF EXISTS reviews_after_change ON "Reviews";
DROP FUNCTION IF EXISTS update_product_average_rating();