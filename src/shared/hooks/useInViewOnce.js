import { useEffect, useRef, useState } from "react";

/**
 * Lightweight hook that detects when an element enters the viewport
 * Once in view, it stays true and disconnects the observer for performance
 *
 * @param {Object} options - IntersectionObserver options
 * @param {string} options.rootMargin - Margin around the root (default: "200px")
 * @param {number} options.threshold - Percentage of target visibility (default: 0.01)
 * @returns {Object} { ref, inView }
 */
export function useInViewOnce({ rootMargin = "200px", threshold = 0.01 } = {}) {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || inView) return;

    // Create observer only once
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setInView(true);
            // Disconnect once in view
            if (observerRef.current) {
              observerRef.current.disconnect();
              observerRef.current = null;
            }
          }
        },
        { rootMargin, threshold }
      );
    }

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [inView, rootMargin, threshold]);

  return { ref, inView };
}
