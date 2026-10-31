import type { StageDef, ViewDef } from "./types";
import { school } from "./stages/school";
import { taxi } from "./stages/taxi";
import { researchCentre } from "./stages/researchCentre";
import { training } from "./stages/training";
import { launchPrep } from "./stages/launchPrep";
import { launch } from "./stages/launch";
import { orbit } from "./stages/orbit";
import { journey } from "./stages/journey";
import { landing } from "./stages/landing";

/** The Earth and Moon view used by the final screen. */
const overview: ViewDef[] = [{ id: "overview", label: "Both", position: [1.5, 2, 15], target: [1.5, 0.3, 0] }];

const complete: StageDef = {
  id: "complete",
  title: "Mission Complete",
  summary: "Review your journey and what you learned.",
  objective: "Review your mission.",
  kind: "complete",
  story: {
    intro: [
      { ur: "مشن مکمل! شاباش، خلابازو!", en: "Mission complete! Well done, astronauts!" },
    ],
  },
  scene: "earth-moon",
  views: overview,
  hotspots: [],
};

/** The 10 stages of the mission, in order. */
export const STAGES: StageDef[] = [
  school,
  taxi,
  researchCentre,
  training,
  launchPrep,
  launch,
  orbit,
  journey,
  landing,
  complete,
];

/** The camera used behind the main menu: Earth and Moon sit to the right of the menu card. */
export const MENU_VIEW: ViewDef = { id: "menu", label: "Menu", position: [-8, 2, 22], target: [-8, 0.3, 0] };
