import { useAuthContext } from "../providers/AuthProvider";

export const useApiFetchFn = () => {
  const auth = useAuthContext();

  return (
    path,
    options,
    { throwOnError = true, disableContentType = false } = {},
  ) =>
    fetch(`${import.meta.env.VITE_API_URL}${path}`, {
      ...options,
      headers: {
        ...(auth?.accessToken
          ? { Authorization: `Bearer ${auth.accessToken}` }
          : undefined),
        ...(!disableContentType
          ? { "Content-Type": "application/json" }
          : undefined),
        ...options?.headers,
      },
    }).then((res) => {
      if (!res.ok && throwOnError) throw res;
      return res;
    });
};
