import { useEffect, useState, type RefObject } from "react";
import { BannerAd } from "./BannerAd";

export function ScrollableIngredientBanner({ contentRef }: {
  contentRef: RefObject<HTMLDivElement>;
}) {
  const [scrollable, setScrollable] = useState(false);

  useEffect(() => {
    const content = contentRef.current;
    if (!content || typeof ResizeObserver === "undefined") return;
    let active = true;
    const measure = () => {
      if (!active) return;
      // Measure only service content, never the banner or its separating gap.
      let bottom = content.getBoundingClientRect().bottom + window.scrollY;
      for (let parent = content.parentElement; parent; parent = parent.parentElement) {
        bottom += Number.parseFloat(getComputedStyle(parent).paddingBottom) || 0;
      }
      setScrollable(bottom > window.innerHeight + 1);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    observer.observe(document.documentElement);
    window.addEventListener("resize", measure);
    measure();
    return () => {
      active = false;
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [contentRef]);

  return scrollable ? <BannerAd /> : null;
}
