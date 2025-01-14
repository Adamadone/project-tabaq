import { useMutation } from "@tanstack/react-query";
import { useApiFetchFn } from "./useApiFetchFn";

export const useChangeRoleMutation = () => {
  const fetchFn = useApiFetchFn();

  return useMutation({
    mutationFn: ({ userId, role }) =>
      fetchFn(`/user/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({
          role,
        }),
      }).then((res) => res.json()),
  });
};
