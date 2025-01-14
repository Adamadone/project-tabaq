import { useRef } from "react";

export const Dialog = ({ isOpen, children }) => {
  return (
    <div
      className={`modal modal-bottom sm:modal-middle ${isOpen ? "modal-open" : ""}`}
      role="dialog"
    >
      <div className="modal-box flex flex-col gap-4">{children}</div>
    </div>
  );
};

export const DialogTitle = ({ children }) => (
  <h3 className="text-lg font-bold">{children}</h3>
);

export const DialogActions = ({ children }) => (
  <div className="modal-action">{children}</div>
);

export const DialogWithData = ({ data, render }) => {
  const children = useRef(null);

  if (!!data) {
    children.current = render(data);
  } else {
    // Enough time for transition
    setTimeout(() => (children.current = null), 500);
  }

  return <Dialog isOpen={!!data}>{children.current}</Dialog>;
};
