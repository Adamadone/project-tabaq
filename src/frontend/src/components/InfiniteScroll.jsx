import { useEffect, useRef } from "react";

export const InfiniteScroll = ({
  children,
  onScrollEndReached,
  disabled = false,
}) => {
  const scrollEndElement = useRef(null);

  const checkForEndOfScroll = (targetElement) => {
    if (targetElement) {
      let reachedEnd = false;

      const rect = targetElement.current.getBoundingClientRect();

      if (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <=
          (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <=
          (window.innerWidth || document.documentElement.clientWidth)
      ) {
        reachedEnd = true;
      }

      if (reachedEnd && onScrollEndReached && !disabled) {
        onScrollEndReached();
      }
    }
  };

  useEffect(() => {
    checkForEndOfScroll();

    const windowScrollCallback = (_scrollEv) => {
      checkForEndOfScroll(scrollEndElement);
    };

    window.addEventListener("scroll", windowScrollCallback);

    return () => {
      window.removeEventListener("scroll", windowScrollCallback);
    };
  }, [onScrollEndReached, disabled]);

  return (
    <>
      {children}
      <div ref={scrollEndElement} id="scrollEndElement"></div>
    </>
  );
};
