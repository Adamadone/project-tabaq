import { useInfiniteQuery } from "@tanstack/react-query";
import { useApiFetchFn } from "./useApiFetchFn";

export const getProductsQueryKey = (params) => ["products", params];

export const useProductsQuery = (
  {
    nameContains,
    resultCount = 10,
    companyId,
    hasTags,
    minRating,
    maxRating,
  } = {},
  options,
) => {
  const fetchFn = useApiFetchFn();

  return useInfiniteQuery({
    ...options,
    queryKey: getProductsQueryKey({
      nameContains,
      resultCount,
      companyId,
      hasTags,
      minRating,
      maxRating,
    }),
    queryFn: ({ pageParam: cursor }) => {
      const params = new URLSearchParams();
      params.append("order", "asc");
      params.append("resultCount", resultCount);
      if (cursor) params.append("cursor", cursor);
      if (nameContains) params.append("nameContains", nameContains);
      if (companyId) params.append("companyId", companyId);
      if (hasTags) params.append("hasTags", hasTags);
      if (minRating) params.append("minRating", minRating);
      if (maxRating) params.append("maxRating", maxRating);

      return fetchFn(`/products/search?${params}`).then((res) => res.json());
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.cursor,
  });
};
