import { useMutation } from "@tanstack/react-query";
import { useApiFetchFn } from "./useApiFetchFn";

export const useDeleteCommentMutation = () => {
  const fetchFn = useApiFetchFn();

  return useMutation({
    mutationFn: ({ commentId }) =>
      fetchFn(`/comments/${commentId}`, {
        method: "DELETE",
      }),
  });
};
