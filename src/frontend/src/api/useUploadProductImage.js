import { useMutation } from "@tanstack/react-query";
import { useApiFetchFn } from "./useApiFetchFn";

export const useUploadProductImageMutation = () => {
  const fetchFn = useApiFetchFn();

  return useMutation({
    mutationFn: ({ file, productId }) => {
      const form = new FormData();
      form.append("file", file);

      return fetchFn(
        `/products/${productId}/upload-image`,
        {
          method: "POST",
          body: form,
        },
        {
          disableContentType: true,
        },
      );
    },
  });
};
