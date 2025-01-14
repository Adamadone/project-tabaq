import { useInfiniteQuery } from "@tanstack/react-query";
import { useApiFetchFn } from "./useApiFetchFn";

export const getReviewsQueryKey = (productId) => [
  "products",
  productId,
  "reviews",
];

export const useReviewsQuery = ({ productId }) => {
  const fetchFn = useApiFetchFn();

  return useInfiniteQuery({
    queryKey: getReviewsQueryKey(productId),
    queryFn: async ({ pageParam: cursor }) => {
      const params = new URLSearchParams();

      if (cursor) params.append("cursor", cursor);

      const fetchResult = await fetchFn(
        `/reviews/product/${productId}?${params}`,
      );

      return await fetchResult.json();
    },
    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor;
    },
  });
};
