import { useEffect, useRef, useState } from "react";

/** Delays value updates until typing pauses, with an immediate update for values already in the cache. */
export function useDebounce<T>(value: T, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(() => value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(() => value), delay);
    timer.current = timeout;
    return () => clearTimeout(timeout);
  }, [value, delay]);

  /** Cancels any pending update and immediately adopts the supplied value. */
  function flush(nextValue: T) {
    if (timer.current !== null) {
      clearTimeout(timer.current);
    }
    setDebouncedValue(() => nextValue);
  }

  return { debouncedValue, flush };
}
