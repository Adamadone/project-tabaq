import { useAuthContext } from "../providers/AuthProvider";

const conditions = {
  guest: () => true,
  user: (role) => ["user", "admin"].includes(role),
  admin: (role) => role === "admin",
};

/** Shows `children` when user has the same or higher role than `requiredRole` */
export const RoleGuard = ({
  children,
  fallback = null,
  requiredRole = "user",
}) => {
  const { user } = useAuthContext();
  const role = user?.role;

  const canSee = conditions[requiredRole](role);

  if (!canSee) return fallback;

  return children;
};
