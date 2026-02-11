"use client";

import { useEffect, useState } from "react";
import { Icon } from "../../primitives";
import styles from "./scroll-to-top-button.module.css";

const VISIBILITY_OFFSET = 320;

export default function ScrollToTopButton({
  threshold = VISIBILITY_OFFSET,
  ariaLabel = "Scroll back to top",
  className = "",
  ...props
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      setIsVisible(window.scrollY > threshold);
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateVisibility);
    };
  }, [threshold]);

  const handleClick = () => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <button
      type="button"
      className={`${styles.button} ${isVisible ? styles.visible : ""} ${className}`.trim()}
      aria-label={ariaLabel}
      onClick={handleClick}
      tabIndex={isVisible ? 0 : -1}
      {...props}
    >
      <Icon name="chevronUp" className={styles.icon} decorative={true} />
    </button>
  );
}
