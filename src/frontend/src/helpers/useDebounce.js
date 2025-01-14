import { useRef, useState } from "react";

export const useDebounce = (value, time) => {
  const [stable, setStable] = useState(value);
  const timeoutRef = useRef(null);

  if (value !== stable.current) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setStable(value);
    }, time);
  }

  return stable;
};
