import { useMutation } from "@tanstack/react-query";
import { useApiFetchFn } from "./useApiFetchFn";

export const useCreateCommentMutation = () => {
  const fetchFn = useApiFetchFn();

  return useMutation({
    mutationFn: ({ reviewId, comment }) =>
      fetchFn(`/reviews/${reviewId}/comments`, {
        method: "POST",
        body: JSON.stringify({
          comment,
        }),
      }).then((res) => res.json()),
  });
};
