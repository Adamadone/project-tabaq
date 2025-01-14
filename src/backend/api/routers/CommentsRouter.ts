import express from "express";
import { Authorize } from "../middleware/Authorize.js";
import { commentsHandler } from "../handlers/CommentsHandler.js";

export const commentsRouter = express.Router();

commentsRouter.delete(
  "/:commentId",
  Authorize(["User", "Admin"]),
  commentsHandler.deleteComment,
);

commentsRouter.put(
  "/:commentId",
  Authorize(["User", "Admin"]),
  commentsHandler.updateComment,
);
