import { useQuery } from "@tanstack/react-query";
import { useApiFetchFn } from "./useApiFetchFn";

export const getCompanyQueryKey = ({ id }) => ["company", id];

export const useCompanyQuery = ({ id }) => {
  const fetchFn = useApiFetchFn();

  return useQuery({
    queryKey: getCompanyQueryKey({ id }),
    queryFn: async () =>
      await fetchFn(`/companies/${id}`).then((res) => res.json()),
  });
};
