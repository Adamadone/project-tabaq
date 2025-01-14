import cors from "cors";
import express from "express";
import bodyParser from "body-parser";

import { userRouter } from "./routers/UserRouter.js";
import { productRouter } from "./routers/ProductsRouter.js";
import { tagsRouter } from "./routers/TagsRouter.js";
import { companiesRouter } from "./routers/CompaniesRouter.js";
import { reviewRouter } from "./routers/ReviewsRouter.js";
import migrator from "node-pg-migrate";
import { env } from "./Env.js";
import { commentsRouter } from "./routers/CommentsRouter.js";
import fileUpload from "express-fileupload";

await migrator({
  databaseUrl: env.dbConnString,
  migrationsTable: "pmigrations",
  dir: "migrations",
  direction: "up",
});

const app = express();
const port = 8080;

// TODO: Migh want to disable this on prod
app.use(cors());
app.use(bodyParser.json());
app.use(
  fileUpload({
    abortOnLimit: true,
    useTempFiles: true,
    limits: {
      fileSize: 5_000_000, // 5 MB
    },
  }),
);

app.use("/user", userRouter);
app.use("/products", productRouter);
app.use("/tags", tagsRouter);
app.use("/companies", companiesRouter);
app.use("/reviews", reviewRouter);
app.use("/comments", commentsRouter);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
