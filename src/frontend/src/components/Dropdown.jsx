const horizontalPositionClasses = {
  left: "dropdown-end",
  default: "",
};

export const Dropdown = ({
  children,
  className = "",
  open,
  isUncontrolled = false,
  items,
  horizontalPosition = "default",
  dropdownClassName = "",
}) => {
  const mappedItems = items.map((item, index) => <li key={index}>{item}</li>);

  return (
    <div className={className}>
      <div
        className={`dropdown w-full ${horizontalPositionClasses[horizontalPosition]} ${open && "dropdown-open"}`}
      >
        {children && <div tabIndex={0}>{children}</div>}
        {(open || isUncontrolled) && (
          <ul
            className={`menu dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 shadow border border-neutral-content ${dropdownClassName}`}
          >
            {mappedItems}
          </ul>
        )}
      </div>
    </div>
  );
};
