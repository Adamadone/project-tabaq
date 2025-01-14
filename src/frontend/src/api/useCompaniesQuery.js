import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useApiFetchFn } from "./useApiFetchFn";

export const COMPANIES_QUERY_KEY = ["companies"];

export const useCompaniesQuery = (queryParams) => {
  const fetchFn = useApiFetchFn();

  return useInfiniteQuery({
    queryKey: COMPANIES_QUERY_KEY,
    queryFn: ({ pageParam: cursor }) => {
      const params = new URLSearchParams();
      params.append("order", "asc");
      params.append("resultCount", queryParams?.resultCount ?? "10");
      if (cursor) params.append("cursor", cursor);

      return fetchFn(`/companies/search?${params}`).then((res) => res.json());
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.cursor,
  });
};
