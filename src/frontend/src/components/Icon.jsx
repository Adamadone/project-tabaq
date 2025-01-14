import React from "react";

const getSizeClass = (size) => {
  const sizes = {
    xs: "w-4 h-4",
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-7 h-7",
  };

  return sizes[size || "md"];
};

const getVariantClass = (variant) => {
  const variants = {
    default: "",
    error: "text-error",
  };

  return variants[variant || "default"];
};

export const Icon = ({ size, variant, children, ...rest }) => {
  const classes = `${getSizeClass(size)} ${getVariantClass(variant)}`;

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
};
