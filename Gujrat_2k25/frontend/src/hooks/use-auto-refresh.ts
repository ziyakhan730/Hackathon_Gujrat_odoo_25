import { useEffect, useRef } from 'react';

export function useAutoRefresh(callback: () => void, intervalMs: number = 15000, enabled: boolean = true) {
  const savedCb = useRef(callback);
  useEffect(() => { savedCb.current = callback; }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    let timer: number | undefined;

    const tick = () => {
      if (document.hidden) return;
      try { savedCb.current(); } catch { /* no-op */ }
    };

    // Initial refresh
    tick();

    // Set interval
    timer = window.setInterval(tick, intervalMs);

    // Refresh on focus/visibility change
    const onFocus = () => tick();
    const onVisibility = () => { if (!document.hidden) tick(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      if (timer) window.clearInterval(timer);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [intervalMs, enabled]);
} 