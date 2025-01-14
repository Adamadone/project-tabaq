import { TCommentsCursor, TCommentsFilter } from "../dao/CommentsDAO";
import { Comment } from "../types/Database";

export function createCommentCursor(
  comment: Comment,
  commentFilter: TCommentsFilter,
): TCommentsCursor {
  const cursor: TCommentsCursor = {
    id: comment.id,
  };

  switch (commentFilter) {
    case "createdAt":
      cursor.createdAt = comment.createdAt;
      break;
    case "updatedAt":
      cursor.updatedAt = comment.updatedAt;
      break;
  }

  return cursor;
}
