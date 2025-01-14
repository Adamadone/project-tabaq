import { useMutation } from "@tanstack/react-query";
import { useApiFetchFn } from "./useApiFetchFn";

export const useUpdateCompanyMutation = () => {
  const fetchFn = useApiFetchFn();

  return useMutation({
    mutationFn: ({ id, name, description }) =>
      fetchFn(`/companies/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          name,
          description,
        }),
      }).then((res) => res.json()),
  });
};
