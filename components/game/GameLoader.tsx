"use client";

import dynamic from "next/dynamic";

// WebGL and localStorage only exist in the browser, so the game is never server-rendered.
const GameApp = dynamic(() => import("./GameApp"), {
  ssr: false,
  loading: () => <div className="loading">Preparing Mission Moon…</div>,
});

export default function GameLoader() {
  return <GameApp />;
}
