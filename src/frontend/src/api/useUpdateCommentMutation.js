import { useMutation } from "@tanstack/react-query";
import { useApiFetchFn } from "./useApiFetchFn";

export const useUpdateCommentMutation = () => {
  const fetchFn = useApiFetchFn();

  return useMutation({
    mutationFn: ({ commentId, comment }) => {
      return fetchFn(`/comments/${commentId}`, {
        method: "PUT",
        body: JSON.stringify({ comment }),
      }).then((res) => res.json());
    },
  });
};
