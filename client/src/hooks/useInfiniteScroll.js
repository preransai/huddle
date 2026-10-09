import { useEffect, useRef } from 'react';

// Returns a ref for an element placed after the last item. When it scrolls
// into view (with some margin so the next page is usually ready before the
// user hits the bottom) the next page is requested.
export function useInfiniteScroll({ hasNextPage, isFetchingNextPage, fetchNextPage }) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasNextPage) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: '600px 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return sentinelRef;
}
