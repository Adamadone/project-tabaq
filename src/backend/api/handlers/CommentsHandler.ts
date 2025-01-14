import { type NextFunction, type Request, type Response } from "express";
import z from "zod";

import { commentsDAO, TCommentsCursor } from "../dao/CommentsDAO.js";
import { base64UrlDecode, base64UrlEncode } from "../lib/Base64Helper.js";
import { TFilterResult } from "../types/Filter.js";
import { Comment } from "../types/Database.js";
import { createCommentCursor } from "../lib/CommentsHelper.js";
import {
  addAuthorsToComments,
  CommentWithAuthor,
} from "../lib/ReviewsHelper.js";

class CommentsHandler {
  async getCommentsForReview(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const paramsValidationObject = z.object({
      reviewId: z.coerce.number().positive(),
    });

    const queryValidationObject = z.object({
      cursor: z.string().base64().optional(),
      limit: z.coerce.number().default(3),
      filter: z
        .union([
          z.literal("id"),
          z.literal("createdAt"),
          z.literal("updatedAt"),
        ])
        .default("createdAt"),
      sortingOrder: z
        .union([z.literal("asc"), z.literal("desc")])
        .default("desc"),
    });

    const { data: paramsData, error: paramsError } =
      paramsValidationObject.safeParse(req.params);

    const { data: queryData, error: queryError } =
      queryValidationObject.safeParse(req.query);

    if (paramsError) {
      res.status(400);
      res.json(paramsError);
      return;
    }

    if (queryError) {
      res.status(400);
      res.json(queryError);
      return;
    }

    try {
      let cursorObject: TCommentsCursor | undefined;

      if (queryData.cursor) {
        cursorObject = JSON.parse(base64UrlDecode(queryData.cursor ?? ""));
      }

      const comments = await commentsDAO.getCommentsForReview(
        paramsData.reviewId,
        queryData.filter,
        queryData.sortingOrder,
        queryData.limit + 1, // Add 1 to limit so we can check for next page
        cursorObject,
      );
      const commentsWithAuthors = await addAuthorsToComments(comments);

      let newCursor: TCommentsCursor | undefined;
      let hasNextPage: boolean = false;
      let commentsToReturn: CommentWithAuthor[] = commentsWithAuthors;

      if (commentsWithAuthors.length > queryData.limit) {
        hasNextPage = true;
        commentsToReturn = commentsWithAuthors.slice(0, comments.length - 1);
      }

      if (commentsToReturn.length > 0) {
        newCursor = createCommentCursor(
          commentsToReturn[commentsToReturn.length - 1],
          queryData.filter,
        );
      }

      const responseBody: TFilterResult<Comment> = {
        cursor: newCursor
          ? base64UrlEncode(JSON.stringify(newCursor))
          : undefined,
        hasNextPage: hasNextPage,
        results: commentsToReturn,
      };

      res.send(responseBody);
    } catch (err) {
      next(err);
    }
  }

  async addCommentToReview(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const paramsValidationObject = z.object({
      reviewId: z.coerce.number().positive(),
    });

    const commentValidationObject = z.object({
      comment: z.string().min(1),
    });

    const { data: paramsData, error: paramsError } =
      paramsValidationObject.safeParse(req.params);

    const { data: bodyData, error: bodyError } =
      commentValidationObject.safeParse(req.body);

    if (paramsError) {
      res.status(400);
      res.json(paramsError);
      return;
    }

    if (bodyError) {
      res.status(400);
      res.json(bodyError);
      return;
    }

    try {
      const createdComment = await commentsDAO.createComment(
        paramsData.reviewId,
        req.userId ?? 0,
        bodyData.comment,
      );
      res.json(createdComment);
    } catch (err) {
      next(err);
    }
  }

  async deleteComment(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const validationObject = z.object({
      commentId: z.coerce.number().positive(),
    });

    const { data, error } = validationObject.safeParse(req.params);

    if (error) {
      res.status(400);
      res.json(error);
      return;
    }

    try {
      await commentsDAO.deleteComment(data.commentId);
      res.status(200).send();
      return;
    } catch (err) {
      next(err);
    }
  }

  async updateComment(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const paramsValidationObject = z.object({
      commentId: z.coerce.number().positive(),
    });

    const commentValidationObject = z.object({
      comment: z.string().min(1),
    });

    const { data: paramsData, error: paramsError } =
      paramsValidationObject.safeParse(req.params);

    const { data: bodyData, error: bodyError } =
      commentValidationObject.safeParse(req.body);

    if (paramsError) {
      res.status(400);
      res.json(paramsError);
      return;
    }

    if (bodyError) {
      res.status(400);
      res.json(bodyError);
      return;
    }

    try {
      const comment = await commentsDAO.getCommentById(paramsData.commentId);

      if (!comment || req.userId !== comment.userId) {
        res.status(404).send();
        return;
      }

      const updatedComment = await commentsDAO.updateComment({
        id: paramsData.commentId,
        comment: bodyData.comment,
      });

      res.json(updatedComment);

      return;
    } catch (err) {
      next(err);
    }
  }
}

const commentsHandler = new CommentsHandler();

export { commentsHandler };
