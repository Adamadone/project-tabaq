export const Select = ({ label, error, options, children, ...props }) => {
  return (
    <label className="form-control w-full">
      <div className="label">
        <span className="label-text">{label}</span>
      </div>
      <select className="select select-bordered w-full" {...props}>
        {children}
        <option value=""></option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
      {error && (
        <div className="label">
          <span className={`label-text-alt text-error`}>{error}</span>
        </div>
      )}
    </label>
  );
};
