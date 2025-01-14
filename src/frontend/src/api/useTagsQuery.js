import { useQuery } from "@tanstack/react-query";
import { useApiFetchFn } from "./useApiFetchFn";

export const useTagsQuery = ({ nameContains, limit }) => {
  const fetchFn = useApiFetchFn();

  return useQuery({
    queryKey: ["tags", nameContains, limit],
    queryFn: () => {
      const params = new URLSearchParams();
      if (nameContains) params.append("nameContains", nameContains);
      if (limit) params.append("limit", limit);
      return fetchFn(`/tags/search?${params}`).then((res) => res.json());
    },
  });
};
