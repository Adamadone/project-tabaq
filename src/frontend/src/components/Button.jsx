import { Spinner } from "./Spinner";

const variantClasses = {
  primary: "btn-primary",
  basic: "",
  ghost: "btn-ghost",
  error: "btn-error",
};

const sizeClasses = {
  md: "",
  sm: "btn-sm",
};

export const Button = ({
  children,
  isLoading,
  variant = "primary",
  size = "md",
  circle = false,
  className = "",
  type = "button",
  ...rest
}) => {
  const variantClass = variantClasses[variant];
  const sizeClass = sizeClasses[size];

  return (
    <button
      type={type}
      {...rest}
      className={`btn ${variantClass} ${sizeClass} ${circle ? "btn-circle" : ""} ${className}`}
    >
      {isLoading && <Spinner />}
      {children}
    </button>
  );
};
