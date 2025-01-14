import { useMutation } from "@tanstack/react-query";
import { useApiFetchFn } from "./useApiFetchFn";

export const useProductDeleteMutation = () => {
  const fetchFn = useApiFetchFn();

  return useMutation({
    mutationFn: ({ productId }) =>
      fetchFn(`/products/${productId}`, {
        method: "DELETE",
      }).then((res) => {
        if (res.status === 204) {
          return { message: "Produkt byl úspěšně smazán" };
        }
        return res.json();
      }),
  });
};
