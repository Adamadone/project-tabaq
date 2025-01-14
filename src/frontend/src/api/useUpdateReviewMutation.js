import { useMutation } from "@tanstack/react-query";
import { useApiFetchFn } from "./useApiFetchFn";

export const useUpdateReviewMutation = () => {
  const fetchFn = useApiFetchFn();

  return useMutation({
    mutationFn: ({ reviewId, rating, comment, productId }) =>
      fetchFn(`/reviews/${reviewId}`, {
        method: "PUT",
        body: JSON.stringify({
          rating,
          comment,
          productId,
        }),
      }).then((res) => res.json()),
  });
};
