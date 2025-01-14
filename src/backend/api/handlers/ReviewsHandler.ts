import { reviewsDAO } from "../dao/ReviewsDAO.js";
import { Request, Response } from "express";
import { z } from "zod";
import {
  addAuthorsToReviewsAndComments,
  addCommentsToReviews,
} from "../lib/ReviewsHelper.js";
import { base64UrlDecode, base64UrlEncode } from "../lib/Base64Helper.js";
import { UsersDAO } from "../dao/UsersDAO.js";

class ReviewHandler {
  static createReviewSchema = z.object({
    productId: z.coerce.number(),
    rating: z.number().min(1).max(5),
    comment: z.string().optional(),
  });

  static updateReviewSchema = z.object({
    id: z.number().int(),
    rating: z.number().min(1).max(5),
    comment: z.string().optional(),
    productId: z.coerce.number(),
  });

  static reviewPaginationSchema = z.object({
    limit: z.coerce.number().default(10),
    cursor: z
      .string()
      .optional()
      .transform((encodedCursor) =>
        encodedCursor ? JSON.parse(base64UrlDecode(encodedCursor)) : undefined,
      )
      .pipe(
        z
          .object({
            id: z.number(),
          })
          .optional(),
      ),
  });

  static async createReview(req: Request, res: Response): Promise<void> {
    try {
      const parsedBody = ReviewHandler.createReviewSchema.parse(req.body);
      const review = await reviewsDAO.createReview({
        userId: req.userId!,
        productId: parsedBody.productId,
        rating: parsedBody.rating,
        comment: parsedBody.comment,
      });
      res.json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  static async updateReview(req: Request, res: Response): Promise<void> {
    try {
      const parsedBody = ReviewHandler.updateReviewSchema.parse({
        ...req.body,
        id: Number(req.params.id),
      });
      const reviewId = parsedBody.id;
      const authenticatedUserId = req.userId!;
      const productId = parsedBody.productId;

      const existingReview = await reviewsDAO.getReviewByUserIdAndProductId(
        authenticatedUserId,
        productId,
      );

      if (!existingReview) {
        res.status(404).json({ error: "Review not found" });
        return;
      }

      const updatedReview = await reviewsDAO.updateReview({
        id: reviewId,
        rating: parsedBody.rating,
        comment: parsedBody.comment,
      });

      res.json(updatedReview);
    } catch (error) {
      console.error("Error updating review:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  static async deleteReview(req: Request, res: Response): Promise<void> {
    try {
      const reviewId = Number(req.params.id);
      const authenticatedUserId = req.userId!;
      const { limit, cursor } = ReviewHandler.reviewPaginationSchema.parse(
        req.query,
      );

      const reviews = await reviewsDAO.getReviewByUserId(
        authenticatedUserId,
        limit,
        cursor,
      );

      const existingReview = reviews.find((review) => review.id === reviewId);

      if (!existingReview) {
        res.status(404).json({ error: "Review not found" });
        return;
      }

      await reviewsDAO.deleteReviewAndComments(reviewId);

      res.sendStatus(204);
    } catch (error) {
      console.error("Error deleting review:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: errorMessage });
    }
  }

  // This is not used anywhere lmao

  static async getReviewByUserId(req: Request, res: Response): Promise<void> {
    try {
      const authenticatedUserId = req.userId;
      const userId = Number(req.params.userId);

      if (authenticatedUserId !== userId) {
        res
          .status(403)
          .json({ error: "You are not authorized to view these reviews" });
        return;
      }

      const { limit, cursor } = ReviewHandler.reviewPaginationSchema.parse(
        req.query,
      );
      const reviews = await reviewsDAO.getReviewByUserId(userId, limit, cursor);
      const reviewsWithComments = await addCommentsToReviews(reviews, 3);

      const nextCursor =
        reviews.length === limit ? reviews[reviews.length - 1].id : null;

      res.json({ reviews: reviewsWithComments, nextCursor });
    } catch (error) {
      console.error("Error getting reviews by user ID:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      if (!res.headersSent) {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  static async getReviewByProductId(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { limit, cursor } = ReviewHandler.reviewPaginationSchema.parse(
        req.query,
      );
      const reviews = await reviewsDAO.getReviewByProductId(
        Number(req.params.productId),
        cursor?.id ?? null,
        limit,
      );

      const reviewsWithComments = await addCommentsToReviews(reviews, 3);
      const reviewsWithCommentsAndAuthors =
        await addAuthorsToReviewsAndComments(reviewsWithComments);

      let nextCursor = null;

      if (reviews.length === limit) {
        nextCursor = base64UrlEncode(
          JSON.stringify({
            id: reviews[reviews.length - 1].id,
          }),
        );
      }

      res.json({ reviews: reviewsWithCommentsAndAuthors, nextCursor });
    } catch (error) {
      console.error("Error getting reviews by product ID:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      if (!res.headersSent) {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  static async getReviewByProductAndUser(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const productId = Number(req.params.productId);
      const userId = req.userId!;
      const review = await reviewsDAO.getReviewByUserIdAndProductId(
        userId,
        productId,
      );
      if (!review) {
        res.json(null);
        return;
      }

      const author = await UsersDAO.getUserById(review.userId);
      res.json({ ...review, author });
    } catch (error) {
      console.error("Error getting reviews by product and user ID:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      if (!res.headersSent) {
        res.status(500).json({ error: errorMessage });
      }
    }
  }
}
export default ReviewHandler;
