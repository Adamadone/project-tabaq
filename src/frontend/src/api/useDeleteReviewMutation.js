import { useMutation } from "@tanstack/react-query";
import { useApiFetchFn } from "./useApiFetchFn";

export const useDeleteReviewMutation = () => {
  const fetchFn = useApiFetchFn();

  return useMutation({
    mutationFn: ({ reviewId }) =>
      fetchFn(`/reviews/${reviewId}`, {
        method: "DELETE",
      }),
  });
};
