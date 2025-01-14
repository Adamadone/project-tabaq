import { useState, Fragment } from "react";
import { Card, CardTitle } from "../../../components/Card.jsx";
import { CardRating } from "../../../components/CardRating.jsx";
import { StarRating } from "../../../components/StarRating.jsx";
import { Button } from "../../../components/Button.jsx";
import { Textarea } from "../../../components/Textarea";
import { StarRatingInput } from "../../../components/StarRatingInput";
import { useCommentsMutation } from "../../../api/useCommentsMutation.js";
import { useDeleteReviewMutation } from "../../../api/useDeleteReviewMutation";
import { useUpdateReviewMutation } from "../../../api/useUpdateReviewMutation";
import { enqueueSnackbar } from "notistack";
import { Comment } from "./Comment.jsx";
import { useGetUpdateReview } from "./useGetUpdateReview.jsx";
import { useQueryClient } from "@tanstack/react-query";
import { AuthorGuard } from "../../../components/AuthorGuard.jsx";
import { RoleGuard } from "../../../components/RoleGuard.jsx";
import {
  Dialog,
  DialogActions,
  DialogTitle,
} from "../../../components/Dialog.jsx";

export const Review = ({
  productId,
  review,
  onCreateComment,
  isUserReview,
}) => {
  const [rating, setRating] = useState(review.rating);
  const [comment, setComment] = useState(review.comment ?? "");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { mutate: getComments, isPending: isGetCommentsPending } =
    useCommentsMutation();
  const updateReviewInCache = useGetUpdateReview();
  const [isEditing, setIsEditing] = useState(false);
  const { mutate: deleteReview, isPending: isDeletePending } =
    useDeleteReviewMutation();
  const { mutate: updateReview } = useUpdateReviewMutation();
  const queryClient = useQueryClient();

  const handleLoadMoreComments = () => {
    getComments(
      {
        reviewId: review.id,
        cursor: review.comments.cursor,
        limit: 20,
      },
      {
        onSuccess: (fetchedComments) => {
          updateReviewInCache({
            productId,
            reviewId: review.id,
            updater: (prevReview) => ({
              ...prevReview,
              comments: {
                ...fetchedComments,
                results: [
                  ...prevReview.comments.results,
                  ...fetchedComments.results,
                ],
              },
            }),
          });
        },
        onError: (error) =>
          enqueueSnackbar(`Došlo k chybě: ${error}`, { variant: "error" }),
      },
    );
  };

  const handleConfirmDelete = () => {
    deleteReview(
      { reviewId: review.id },
      {
        onSuccess: () => {
          enqueueSnackbar("Recenze byla smazána", { variant: "success" });
          queryClient.setQueryData(["myReview", productId], null);
          queryClient.invalidateQueries(["reviews", productId]);
          queryClient.setQueryData(["product", productId], null);
        },
        onError: (error) =>
          enqueueSnackbar(`Došlo k chybě: ${error}`, { variant: "error" }),
      },
    );
  };

  const handleUpdate = (event) => {
    event.preventDefault();
    updateReview(
      {
        reviewId: review.id,
        rating: rating,
        comment: comment.trim(),
        productId,
      },
      {
        onSuccess: (updatedReview) => {
          enqueueSnackbar("Recenze byla upravena", { variant: "success" });
          setIsEditing(false);

          updateReviewInCache({
            productId,
            reviewId: review.id,
            updater: (prevReview) => ({
              ...prevReview,
              rating: updatedReview.rating,
              comment: updatedReview.comment,
              updatedAt: updatedReview.updatedAt,
            }),
          });
          queryClient.setQueryData(["myReview", productId], (prevMyReview) => ({
            ...prevMyReview,
            rating: updatedReview.rating,
            comment: updatedReview.comment,
            updatedAt: updatedReview.updatedAt,
          }));
          queryClient.invalidateQueries(["product", productId]);
        },
        onError: (error) =>
          enqueueSnackbar(`Došlo k chybě: ${error}`, { variant: "error" }),
      },
    );
  };

  if (isEditing) {
    return (
      <Card>
        <form onSubmit={handleUpdate}>
          <CardTitle>Vaše recenze</CardTitle>
          <div className="flex items-start gap-2">
            {rating}
            <StarRatingInput value={rating} onChange={setRating} />
          </div>
          <Textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
          <div className="flex flex-row-reverse gap-2 mt-2">
            <Button type="submit">Uložit</Button>
            <Button variant="basic" onClick={() => setIsEditing(false)}>
              Zrušit
            </Button>
          </div>
        </form>
      </Card>
    );
  }

  return (
    <>
      <Dialog isOpen={isDeleteDialogOpen}>
        <DialogTitle>Opravdu si přejete smazat tuto recenzi?</DialogTitle>
        <p>Tato akce je nevratná</p>
        <DialogActions>
          <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)}>
            Zrušit
          </Button>
          <Button
            variant="error"
            isLoading={isDeletePending}
            onClick={handleConfirmDelete}
          >
            Odstranit
          </Button>
        </DialogActions>
      </Dialog>

      <Card>
        <div className="flex justify-between items-center">
          <h3>{review.author.name}</h3>
          <div className="flex items-center gap-2">
            <CardRating>{review.rating}</CardRating>
            <StarRating rating={review.rating} />
          </div>
        </div>
        <span>{review.comment ?? ""}</span>

        {isUserReview && (
          <AuthorGuard authorId={review.author.id}>
            <div className="flex flex-row-reverse gap-2 mt-2">
              <Button variant="basic" onClick={() => setIsEditing(true)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                  />
                </svg>
              </Button>
              <Button
                variant="error"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>
              </Button>
            </div>
          </AuthorGuard>
        )}

        {!isUserReview && (
          <RoleGuard requiredRole="user">
            <div className="flex flex-row-reverse">
              <Button variant="basic" onClick={onCreateComment}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                  />
                </svg>
              </Button>
            </div>
          </RoleGuard>
        )}
      </Card>

      {!isUserReview && (
        <div>
          {review.comments.results.map((comment) => (
            <div key={comment.id} className="ml-8 p-2">
              <Comment
                comment={comment}
                productId={productId}
                reviewId={review.id}
              />
            </div>
          ))}
          {review.comments.hasNextPage && (
            <div className="ml-8">
              <Button
                variant="basic"
                onClick={handleLoadMoreComments}
                isLoading={isGetCommentsPending}
              >
                Načíst víc
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
};
