export const Textarea = ({ label, error, ...rest }) => {
  return (
    <label className="form-control w-full">
      <div className="label">
        <span className="label-text">{label}</span>
      </div>
      <textarea
        {...rest}
        type="text"
        className={`input input-bordered py-2 w-full h-36 text-wrap ${error && "input-error"}`}
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
