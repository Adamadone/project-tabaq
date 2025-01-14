import express from "express";

import { Authorize } from "../middleware/Authorize.js";
import { productsHandler } from "../handlers/ProductsHandler.js";

export const productRouter = express.Router();

productRouter.get("/search", productsHandler.searchProducts);

productRouter.get("/:productId/image", productsHandler.getImage);

productRouter.get("/:id", productsHandler.getProductData);

productRouter.post("/", Authorize(["Admin"]), productsHandler.createProduct);

productRouter.put("/:id", Authorize(["Admin"]), productsHandler.updateProduct);

productRouter.delete(
  "/:id",
  Authorize(["Admin"]),
  productsHandler.deleteProduct,
);

productRouter.post("/:productId/upload-image", productsHandler.uploadImage);
