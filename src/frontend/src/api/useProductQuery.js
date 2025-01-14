import { useQuery } from "@tanstack/react-query";
import { useApiFetchFn } from "./useApiFetchFn";

export const getProductQueryKey = (productId) => ["products", productId];

export const useProductQuery = (productId) => {
  const fetchFn = useApiFetchFn();

  return useQuery({
    queryKey: getProductQueryKey(productId),
    queryFn: () => fetchFn(`/products/${productId}`).then((res) => res.json()),
  });
};
