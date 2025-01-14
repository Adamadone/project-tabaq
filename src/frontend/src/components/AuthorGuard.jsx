import { useAuthContext } from "../providers/AuthProvider";

export const AuthorGuard = ({ authorId, children, fallback = null }) => {
  const { user } = useAuthContext();

  if (!user || user.id !== authorId) {
    return fallback;
  }

  return children;
};
