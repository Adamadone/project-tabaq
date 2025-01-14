export const TextInput = ({ label, error, ...rest }) => {
  return (
    <label className="form-control w-full">
      {label && (
        <div className="label">
          <span className="label-text">{label}</span>
        </div>
      )}
      <input
        {...rest}
        type="text"
        className={`input input-bordered w-full text-black ${error ? "input-error" : ""}`}
      />
      {error && (
        <div className="label">
          <span className={`label-text-alt ${error && "text-error"}`}>
            {error}
          </span>
        </div>
      )}
    </label>
  );
};
