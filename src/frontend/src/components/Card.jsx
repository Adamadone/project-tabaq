export const Card = ({ children, className = "", ...rest }) => {
  return (
    <div
      className={`card bg-base-100 border border-neutral-content shadow-md ${className}`}
      {...rest}
    >
      <div className="card-body">{children}</div>
    </div>
  );
};

export const CardTitle = ({ children }) => (
  <h2 className="card-title mb-2">{children}</h2>
);

export const CardSubTitle = ({ className = "", children }) => (
  <h3 className={`card-title text-base ${className}`}>{children}</h3>
);

export const CardActions = ({ children }) => (
  <div className="mt-2 flex justify-end gap-2">{children}</div>
);
