import { useState, useEffect, useRef } from 'react';

export function useCountUp(target: number, duration = 1500, decimals = 0): number {
  const [count, setCount] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    const start = prevTarget.current;
    prevTarget.current = target;
    const diff = target - start;
    if (diff === 0) return;

    const startTime = performance.now();
    let raf: number;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current = start + diff * eased;
      setCount(Number(current.toFixed(decimals)));
      if (progress < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, decimals]);

  return count;
}
