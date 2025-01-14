import { useMutation } from "@tanstack/react-query";
import { useApiFetchFn } from "./useApiFetchFn";

export const useCommentsMutation = () => {
  const fetchFn = useApiFetchFn();

  return useMutation({
    mutationFn: ({ reviewId, cursor, limit, sortingOrder = "asc" }) => {
      const params = new URLSearchParams();
      if (cursor) params.append("cursor", cursor);
      if (limit) params.append("limit", limit);
      if (sortingOrder) params.append("sortingOrder", sortingOrder);

      return fetchFn(`/reviews/${reviewId}/comments?${params}`).then((res) =>
        res.json(),
      );
    },
  });
};
