import { useState } from "react";
import { Card, CardActions, CardTitle } from "../../../components/Card";
import { StarRatingInput } from "../../../components/StarRatingInput";
import { Textarea } from "../../../components/Textarea";
import { Button } from "../../../components/Button";
import { useCreateReviewMutation } from "../../../api/useCreateReviewMutation";
import { enqueueSnackbar } from "notistack";
import { useQueryClient } from "@tanstack/react-query";

export const CreateReviewForm = ({ productId }) => {
  const [rating, setRating] = useState(3);
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();

  const { mutate: createReview, isPending: isReviewPending } =
    useCreateReviewMutation();

  const handleSubmit = (e) => {
    e.preventDefault();

    createReview(
      {
        productId,
        rating: rating,
        comment: comment,
      },
      {
        onSuccess: async () => {
          enqueueSnackbar("Recenze byla vytvořena", { variant: "success" }),
            queryClient.invalidateQueries(["reviews", productId]);
        },
        onError: (error) =>
          enqueueSnackbar(
            `Při vytváření recenze došlo k chybě: ${error.message}`,
            { variant: "error" },
          ),
      },
    );
  };

  return (
    <Card>
      <CardTitle>Napište recenzi</CardTitle>
      <form onSubmit={handleSubmit}>
        <StarRatingInput value={rating} onChange={setRating} />
        <Textarea
          value={comment}
          placeholder="Komentář"
          onChange={(e) => setComment(e.target.value)}
        />
        <CardActions>
          <Button variant="primary" type="submit" isLoading={isReviewPending}>
            Vytvořit
          </Button>
        </CardActions>
      </form>
    </Card>
  );
};
