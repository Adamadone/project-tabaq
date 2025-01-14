import { useQuery } from "@tanstack/react-query";
import { useApiFetchFn } from "./useApiFetchFn";

export const useMyReviewQuery = (productId, enabled) => {
  const fetchFn = useApiFetchFn();

  return useQuery({
    queryKey: ["myReview", productId],
    queryFn: () => {
      return fetchFn(`/reviews/product/${productId}/myReview`).then((res) =>
        res.json(),
      );
    },
    retry: 1,
    enabled,
  });
};
