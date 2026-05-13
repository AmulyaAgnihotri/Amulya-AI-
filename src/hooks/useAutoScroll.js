import { useEffect, useRef } from 'react';

/**
 * Custom hook for smooth auto-scrolling to the bottom of a container.
 * @param {Array} dependencies - Values that trigger auto-scroll when changed
 * @returns {React.RefObject} Ref to attach to the scrollable container
 */
export function useAutoScroll(dependencies = []) {
  const containerRef = useRef(null);
  const shouldAutoScroll = useRef(true);

  // Check if user has scrolled up (disable auto-scroll)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      shouldAutoScroll.current = isNearBottom;
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scroll when dependencies change
  useEffect(() => {
    if (shouldAutoScroll.current && containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, dependencies);

  return containerRef;
}
