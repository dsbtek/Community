import { useEffect, useRef } from 'react';

export function useInfiniteScroll(
    callback: () => void,
    hasMore: boolean,
    loading: boolean,
) {
    const observer = useRef<IntersectionObserver | null>(null);
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (loading) return;
        if (!hasMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new window.IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                callback();
            }
        });
        if (sentinelRef.current) {
            observer.current.observe(sentinelRef.current);
        }
        return () => observer.current?.disconnect();
    }, [callback, hasMore, loading]);

    return sentinelRef;
}
