import { Card } from "../../../components/Card";
import { Button } from "../../../components/Button";
import { useDeleteCommentMutation } from "../../../api/useDeleteCommentMutation";
import { enqueueSnackbar } from "notistack";
import { useGetUpdateReview } from "./useGetUpdateReview";
import { AuthorGuard } from "../../../components/AuthorGuard";
import { UpdateCommentDialog } from "./UpdateCommentDialog";
import { useState } from "react";
import { Dialog, DialogActions, DialogTitle } from "../../../components/Dialog";

export const Comment = ({ comment, productId, reviewId }) => {
  const { mutate: deleteComment, isPending: isDeleteCommentPending } =
    useDeleteCommentMutation();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const updateReviewInCache = useGetUpdateReview();

  const handleConfirmDelete = () => {
    deleteComment(
      { commentId: comment.id },
      {
        onSuccess: () => {
          enqueueSnackbar("Komentář byl smazán", { variant: "success" });
          updateReviewInCache({
            productId,
            reviewId,
            updater: (prevReview) => ({
              ...prevReview,
              comments: {
                ...prevReview.comments,
                results: prevReview.comments.results.filter(
                  (commentItem) => commentItem.id !== comment.id,
                ),
              },
            }),
          });
        },
        onError: (error) =>
          enqueueSnackbar(`Došlo k chybě: ${error}`, { variant: "error" }),
      },
    );
  };

  return (
    <>
      <UpdateCommentDialog
        comment={isUpdating && comment}
        productId={productId}
        onClose={() => setIsUpdating(false)}
      />
      <Dialog isOpen={isDeleteDialogOpen}>
        <DialogTitle>Opravdu si přejete smazat tento komentář?</DialogTitle>
        <p>Tato akce je nevratná</p>
        <DialogActions>
          <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)}>
            Zrušit
          </Button>
          <Button
            variant="error"
            isLoading={isDeleteCommentPending}
            onClick={handleConfirmDelete}
          >
            Odstranit
          </Button>
        </DialogActions>
      </Dialog>

      <Card>
        <div className="flex justify-between">
          <div>
            <h3>{comment.author.name}</h3>
            {comment.comment}
          </div>
          <AuthorGuard authorId={comment.author.id}>
            <div className="flex flex-row-reverse gap-2 mt-2">
              <Button
                variant="basic"
                isLoading={isDeleteCommentPending}
                onClick={() => setIsUpdating(true)}
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
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                  />
                </svg>
              </Button>
              <Button
                variant="error"
                isLoading={isDeleteCommentPending}
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
        </div>
      </Card>
    </>
  );
};
