"use client";

import { useEffect, useRef } from "react";

/** Tracks which keys are currently held. Read `keys.current` inside animation frames. */
export function useKeys() {
  const keys = useRef(new Set<string>());

  useEffect(() => {
    const pressed = keys.current;
    const isTyping = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      return tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA";
    };
    const down = (e: KeyboardEvent) => {
      if (!isTyping(e) && !e.ctrlKey && !e.metaKey && !e.altKey) pressed.add(e.key.toLowerCase());
    };
    const up = (e: KeyboardEvent) => pressed.delete(e.key.toLowerCase());
    const clear = () => pressed.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
    };
  }, []);

  return keys;
}
