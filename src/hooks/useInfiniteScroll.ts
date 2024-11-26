import { useCallback, useRef, useEffect } from 'react';

export const useInfiniteScroll = (loadMore: () => void, hasMore: boolean) => {
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef(loadMore);

  useEffect(() => {
    loadMoreRef.current = loadMore;
  }, [loadMore]);

  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        entries => {
          if (entries[0].isIntersecting && hasMore) {
            loadMoreRef.current();
          }
        },
        {
          root: null,
          rootMargin: '0px',
          threshold: 0.1,
        },
      );
      if (node) observer.current.observe(node);
    },
    [hasMore],
  );

  return { lastElementRef };
};
