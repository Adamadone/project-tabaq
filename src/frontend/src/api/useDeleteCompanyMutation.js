import { useMutation } from "@tanstack/react-query";
import { useApiFetchFn } from "./useApiFetchFn";

export const useDeleteCompanyMutation = () => {
  const fetchFn = useApiFetchFn();

  return useMutation({
    mutationFn: ({ id }) =>
      fetchFn(`/companies/${id}`, {
        method: "delete",
      }),
  });
};
