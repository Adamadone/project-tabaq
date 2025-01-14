import { useMutation } from "@tanstack/react-query";
import { useApiFetchFn } from "./useApiFetchFn";

export const useProductCreateMutation = () => {
  const fetchFn = useApiFetchFn();

  return useMutation({
    mutationFn: ({ title, description, companyId, tags }) =>
      fetchFn(`/products`, {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
          companyId,
          tags,
        }),
      }).then((res) => res.json()),
  });
};
