import express from "express";
import { Authorize } from "../middleware/Authorize.js";
import ReviewHandler from "../handlers/ReviewsHandler.js";
import { commentsHandler } from "../handlers/CommentsHandler.js";

export const reviewRouter = express.Router();

reviewRouter.post(
  "/",
  Authorize(["User", "Admin"]),
  ReviewHandler.createReview,
);

reviewRouter.put(
  "/:id",
  Authorize(["User", "Admin"]),
  ReviewHandler.updateReview,
);

reviewRouter.delete(
  "/:id",
  Authorize(["User", "Admin"]),
  ReviewHandler.deleteReview,
);

reviewRouter.get("/product/:productId", ReviewHandler.getReviewByProductId);

reviewRouter.get(
  "/product/:productId/myReview",
  Authorize(["User", "Admin"]),
  ReviewHandler.getReviewByProductAndUser,
);

// Review comments

reviewRouter.get("/:reviewId/comments", commentsHandler.getCommentsForReview);

reviewRouter.post(
  "/:reviewId/comments",
  Authorize(["User", "Admin"]),
  commentsHandler.addCommentToReview,
);
