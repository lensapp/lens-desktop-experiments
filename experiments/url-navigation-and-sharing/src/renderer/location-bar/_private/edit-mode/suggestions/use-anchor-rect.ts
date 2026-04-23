import type React from "react";
import { useLayoutEffect, useState } from "react";

export const useAnchorRect = (anchorRef: React.RefObject<HTMLElement | null>): DOMRect | undefined => {
  const [rect, setRect] = useState<DOMRect | undefined>(undefined);

  useLayoutEffect(() => {
    const element = anchorRef.current;

    if (!element) {
      return undefined;
    }

    const update = () => setRect(element.getBoundingClientRect());

    update();

    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [anchorRef]);

  return rect;
};
