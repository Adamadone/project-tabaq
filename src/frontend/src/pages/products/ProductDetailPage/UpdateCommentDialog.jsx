import { Button } from "../../../components/Button";
import {
  Dialog,
  DialogActions,
  DialogTitle,
  DialogWithData,
} from "../../../components/Dialog";
import { enqueueSnackbar } from "notistack";
import { useUpdateCommentMutation } from "../../../api/useUpdateCommentMutation";
import { Textarea } from "../../../components/Textarea";
import { useGetUpdateReview } from "./useGetUpdateReview";
import { useState } from "react";

export const UpdateCommentDialog = ({ comment, productId, onClose }) => {
  return (
    <DialogWithData
      data={comment}
      render={(comment) => (
        <UpdateCommentDialogContent
          comment={comment}
          productId={productId}
          onClose={onClose}
        />
      )}
    />
  );
};

const UpdateCommentDialogContent = ({ comment, productId, onClose }) => {
  const [content, setContent] = useState(comment.comment);
  const [error, setError] = useState(null);
  const updateReview = useGetUpdateReview();

  const { mutate, isPending } = useUpdateCommentMutation();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (content.trim().length === 0) {
      setError("Komentář nemůže být prázdný");
      return;
    }

    mutate(
      { commentId: comment.id, comment: content },
      {
        onSuccess: () => {
          enqueueSnackbar("Komentář byl upraven", { variant: "success" });
          updateReview({
            productId,
            reviewId: comment.reviewId,
            updater: (prev) => {
              return {
                ...prev,
                comments: {
                  ...prev.comments,
                  results: prev.comments.results.map((prevComment) => {
                    if (prevComment.id !== comment.id) return prevComment;
                    return { ...prevComment, comment: content };
                  }),
                },
              };
            },
          });
          onClose();
        },
        onError: (error) => {
          enqueueSnackbar(
            `Při uprávě komentáře došlo k chybě: ${error.message}` +
              { variant: "error" },
          );
        },
      },
    );
  };

  return (
    <>
      <DialogTitle>Upravit komentář</DialogTitle>
      <form onSubmit={handleSubmit}>
        <Textarea
          placeholder="Komentář"
          value={content}
          error={error}
          onChange={(e) => setContent(e.target.value)}
        />

        <DialogActions>
          <Button variant="basic" onClick={onClose}>
            Zrušit
          </Button>
          <Button type="submit" isLoading={isPending}>
            Upravit
          </Button>
        </DialogActions>
      </form>
    </>
  );
};
