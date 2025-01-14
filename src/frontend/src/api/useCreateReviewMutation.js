import { useMutation } from "@tanstack/react-query";
import { useApiFetchFn } from "./useApiFetchFn";

export const useCreateReviewMutation = () => {
  const fetchFn = useApiFetchFn();

  return useMutation({
    mutationFn: ({ productId, rating, comment }) =>
      fetchFn(`/reviews`, {
        method: "POST",
        body: JSON.stringify({
          productId,
          rating,
          comment,
        }),
      }),
  });
};
