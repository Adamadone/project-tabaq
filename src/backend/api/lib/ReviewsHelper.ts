import {
  commentsDAO,
  TCommentsCursor,
  TCommentsFilter,
} from "../dao/CommentsDAO.js";
import { UsersDAO } from "../dao/UsersDAO.js";
import { Comment, Review } from "../types/Database.js";
import type { TFilterResult } from "../types/Filter";
import { base64UrlEncode } from "./Base64Helper.js";
import { createCommentCursor } from "./CommentsHelper.js";

export type ReviewWithComments = Review & {
  comments: TFilterResult<Comment>;
};

export type CommentWithAuthor = Comment & {
  author: { id: number; name: string };
};

export type ReviewWithCommentsAndAuthor = Review & {
  author: {
    id: number;
    name: string;
  };
  comments: TFilterResult<CommentWithAuthor>;
};

export async function addCommentsToReviews(
  reviews: Review[],
  commentsLimit: number = 3,
): Promise<ReviewWithComments[]> {
  const reviewsWithComments: ReviewWithComments[] = [];

  for (const review of reviews) {
    const reviewComments = await commentsDAO.getCommentsForReview(
      review.id,
      "createdAt",
      "asc",
      commentsLimit + 1,
    );

    const reviewWithComments: ReviewWithComments = Object.assign(
      structuredClone(review),
      {
        comments: getCommentsToReturn(
          reviewComments,
          commentsLimit,
          "createdAt",
        ),
      },
    );

    reviewsWithComments.push(reviewWithComments);
  }

  return reviewsWithComments;
}

export async function addAuthorsToReviewsAndComments(
  reviews: ReviewWithComments[],
): Promise<ReviewWithCommentsAndAuthor[]> {
  const reviewsWithAuthorPromises = reviews.map(async (review) => {
    const reviewAuthor = await UsersDAO.getUserById(review.userId);
    if (!reviewAuthor)
      throw new Error(
        `User [${review.userId}] for review [${review.id}] not found`,
      );

    const commentsWithAuthor = await addAuthorsToComments(
      review.comments.results,
    );

    return {
      ...review,
      author: reviewAuthor,
      comments: {
        ...review.comments,
        results: commentsWithAuthor,
      },
    };
  });
  return Promise.all(reviewsWithAuthorPromises);
}

export const addAuthorsToComments = async (
  comments: Comment[],
): Promise<CommentWithAuthor[]> => {
  const commentsWithAuthorPromises = comments.map(async (comment) => {
    const commentAuthor = await UsersDAO.getUserById(comment.userId);
    if (!commentAuthor)
      throw new Error(
        `User [${comment.userId}] for comment [${comment.id}] not found`,
      );
    return { ...comment, author: commentAuthor };
  });

  return await Promise.all(commentsWithAuthorPromises);
};

function getCommentsToReturn(
  comments: Comment[],
  requestedComments: number,
  commentsFilter: TCommentsFilter,
): TFilterResult<Comment> {
  let hasNextPage = false;
  let cursor: TCommentsCursor | undefined;

  if (comments.length > requestedComments) {
    comments = comments.slice(0, requestedComments);
    hasNextPage = true;
  }

  if (comments.length > 0) {
    cursor = createCommentCursor(comments[comments.length - 1], commentsFilter);
  }

  return {
    hasNextPage: hasNextPage,
    cursor: cursor ? base64UrlEncode(JSON.stringify(cursor)) : undefined,
    results: comments,
  };
}
