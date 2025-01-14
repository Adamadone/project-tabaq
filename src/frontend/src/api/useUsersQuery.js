import { useInfiniteQuery } from "@tanstack/react-query";
import { useApiFetchFn } from "./useApiFetchFn";

export const USERS_QUERY_KEY = ["users"];

export const useUsersQuery = () => {
  const fetchFn = useApiFetchFn();

  return useInfiniteQuery({
    queryKey: USERS_QUERY_KEY,
    queryFn: ({ pageParam: cursor }) => {
      const params = new URLSearchParams();
      params.append("filter", "id");
      params.append("order", "asc");
      params.append("resultCount", "10");
      if (cursor) params.append("cursor", cursor);

      return fetchFn(`/user/search?${params}`).then((res) => res.json());
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.cursor,
  });
};
