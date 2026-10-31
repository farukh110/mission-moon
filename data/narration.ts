import type { StoryLine } from "./types";

/** Lines used by several scenes (the stage stories live with each stage). */
export const LIFTOFF_LINE: StoryLine = { ur: "لفٹ آف!", en: "Liftoff!" };

/** The countdown, said in Urdu. */
export const COUNTDOWN_LINES: Record<number, StoryLine> = {
  5: { ur: "پانچ", en: "5" },
  4: { ur: "چار", en: "4" },
  3: { ur: "تین", en: "3" },
  2: { ur: "دو", en: "2" },
  1: { ur: "ایک", en: "1" },
};

/** The guards at the research centre gate. */
export const GATE_LINES: Record<"stop" | "check" | "open", StoryLine> = {
  stop: { ur: "ٹیکسی گیٹ پر رک گئی۔ گارڈ آ رہا ہے۔", en: "The taxi stops at the gate. A guard is coming." },
  check: { ur: "گارڈ ٹیکسی اور بچوں کو چیک کر رہا ہے۔", en: "The guard checks the taxi and the students." },
  open: { ur: "سب ٹھیک ہے! گیٹ کھل گیا، اب آپ اندر جا سکتے ہیں۔", en: "All clear! The gate is open. You may go in." },
};
