"use client";

import { useEffect, useRef } from "react";

/** Holds the newest value in a ref, so frame loops and timers never see a stale callback. */
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}
