import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "./Button";
import { Icon } from "./Icon";

export const Tag = ({ title, isActive = false, onClick, onRemove }) => {
  return (
    <div>
      <button
        className={`rounded-2xl px-4 py-2 transition-all ${isActive ? "bg-secondary text-white font-bold" : "bg-base-300"}`}
        disabled={!onClick && !onRemove}
        onClick={() => {
          onClick?.();
          onRemove?.();
        }}
      >
        <div className="flex justify-center items-center gap-2">
          {title}
          {onRemove && (
            <Icon size="xs">
              <XMarkIcon />
            </Icon>
          )}
        </div>
      </button>
    </div>
  );
};
