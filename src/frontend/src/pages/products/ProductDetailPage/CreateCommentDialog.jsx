import { useState } from "react";
import { Button } from "../../../components/Button";
import { Dialog, DialogActions, DialogTitle } from "../../../components/Dialog";
import { Textarea } from "../../../components/Textarea";
import { useCreateCommentMutation } from "../../../api/useCreateComment";
import { enqueueSnackbar } from "notistack";
import { useQueryClient } from "@tanstack/react-query";
import { getReviewsQueryKey } from "../../../api/useReviewsQuery";
import { useCommentsMutation } from "../../../api/useCommentsMutation";
import { useGetUpdateReview } from "./useGetUpdateReview";

export const CreateCommentDialog = ({ reviewId, productId, onClose }) => {
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState(null);

  const queryClient = useQueryClient();
  const { mutate: createComment, isPending: isCreateCommentPending } =
    useCreateCommentMutation();
  const { mutateAsync: getComments } = useCommentsMutation();
  const updateReview = useGetUpdateReview();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (comment.trim().length === 0) {
      setCommentError("Komentář nemůže být prázdný");
      return;
    }

    setCommentError(null);
    createComment(
      {
        reviewId,
        comment,
      },
      {
        onSuccess: async () => {
          const reviews = queryClient.getQueryData(
            getReviewsQueryKey(productId),
          );
          const review = reviews.pages
            .map((page) =>
              page.reviews.find((review) => review.id === reviewId),
            )
            .find(Boolean);
          const comments = review.comments.results;
          const newComments =
            comments.length <= 3 && (await getComments({ reviewId, limit: 3 }));

          enqueueSnackbar("Komentář byl vytvořen", { variant: "success" });
          setComment("");
          updateReview({
            productId,
            reviewId,
            updater: (prevReview) => {
              if (!newComments)
                return {
                  ...prevReview,
                  comments: {
                    ...prevReview.comments,
                    hasNextPage: true,
                  },
                };

              return {
                ...prevReview,
                comments: newComments,
              };
            },
          });
          onClose();
        },
        onError: () =>
          enqueueSnackbar("Něco se pokazilo", { variant: "error" }),
      },
    );
  };

  return (
    <Dialog isOpen={!!reviewId}>
      <DialogTitle>Okomentovat recenzi</DialogTitle>
      <form onSubmit={handleSubmit}>
        <Textarea
          placeholder="Komentář"
          value={comment}
          error={commentError}
          onChange={(e) => setComment(e.target.value)}
        />
        <DialogActions>
          <Button variant="basic" onClick={onClose}>
            Zavřít
          </Button>
          <Button type="submit" isLoading={isCreateCommentPending}>
            Okomentovat
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
