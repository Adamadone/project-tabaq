import { useMutation } from "@tanstack/react-query";
import { useApiFetchFn } from "./useApiFetchFn";

export const useCreateCompanyMutation = () => {
  const fetchFn = useApiFetchFn();

  return useMutation({
    mutationFn: ({ name, description }) =>
      fetchFn(`/companies`, {
        method: "POST",
        body: JSON.stringify({
          name,
          description,
        }),
      }).then((res) => res.json()),
  });
};
