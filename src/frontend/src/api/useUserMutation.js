import { useMutation } from "@tanstack/react-query";
import { useApiFetchFn } from "./useApiFetchFn";

export const useUserMutation = () => {
  const fetchFn = useApiFetchFn();

  return useMutation({
    mutationFn: ({ token }) =>
      fetchFn("/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((res) => res.json()),
  });
};
