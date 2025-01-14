import { useMutation } from "@tanstack/react-query";
import { useApiFetchFn } from "./useApiFetchFn";

export const useProductEditMutation = () => {
  const fetchFn = useApiFetchFn();

  return useMutation({
    mutationFn: ({ productId, title, description, companyId, tags }) =>
      fetchFn(`/products/${productId}`, {
        method: "PUT",
        body: JSON.stringify({
          title,
          description,
          companyId,
          tags,
        }),
      }).then((res) => res.json()),
  });
};
