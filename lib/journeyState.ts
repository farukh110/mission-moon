// Journey progress (0..1) is read every frame by the 3D scene and written by the status panel.
// Keeping it outside React state avoids re-rendering the whole game 60 times a second.
let progress = 0;

export const getJourneyProgress = () => progress;
export const setJourneyProgress = (p: number) => {
  progress = Math.min(1, Math.max(0, p));
};
