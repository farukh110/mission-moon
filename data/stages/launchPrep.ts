import type { StageDef } from "../types";

export const launchPrep: StageDef = {
  id: "launch-prep",
  title: "Launch Preparation",
  summary: "Inspect the rocket on the launchpad and finish the pre-launch checklist.",
  objective: "Complete the pre-launch checklist to unlock the launch.",
  kind: "explore",
  autoAdvance: { seconds: 14, after: "enter" },
  scene: "launch",
  story: {
    intro: [
      { ur: "راکٹ لانچ پیڈ پر تیار کھڑا ہے۔ خلاباز اس میں سوار ہونے والے ہیں۔", en: "The rocket stands ready on the launchpad. The astronauts are about to climb aboard." },
      { ur: "راکٹ کے انجن گرم گیس کو نیچے پھینکتے ہیں، جس سے راکٹ اوپر اٹھتا ہے۔ اس دھکے کو تھرسٹ کہتے ہیں۔", en: "The rocket engines push hot gas down. This lifts the rocket up. This push is called thrust." },
      { ur: "تھرسٹ کو کشش ثقل سے زیادہ ہونا چاہیے، تب ہی راکٹ اوپر جاتا ہے۔", en: "Thrust must be stronger than gravity. Then the rocket can rise." },
    ],
  },
  orbit: { min: 5, max: 40 },
  disclaimer: "This launchpad is a fictional, simplified model. Real rockets are far more complex.",
  views: [
    { id: "overview", label: "Launchpad", position: [10, 6, 24], target: [0, 5, 0] },
    { id: "engines", label: "Engines", position: [3.5, 2.2, 8], target: [0, 1, 0] },
    { id: "capsule", label: "Capsule", position: [4, 10, 8], target: [0, 8.7, 0] },
    { id: "tower", label: "Tower", position: [9, 7, 11], target: [3, 6, 0] },
  ],
  hotspots: [
    {
      id: "engines",
      title: "Rocket Engines",
      short: "Where thrust comes from.",
      detail: [
        "Rocket engines burn fuel very quickly. The hot gas rushes out of the bottom at high speed.",
        "As the gas is pushed down, the rocket is pushed up. This push is called thrust.",
      ],
      keyConcept: "Thrust is the push that lifts a rocket. It must be stronger than gravity's pull.",
      instructions: "Look at the engine nozzles at the bottom.",
      position: [0, 0.7, 1.8],
    },
    {
      id: "fuel",
      title: "Fuel Tanks",
      short: "Most of the rocket is fuel.",
      detail: [
        "Most of a rocket's weight at launch is fuel. It needs a huge amount of energy to reach space.",
        "Rocket fuel burns together with oxygen. Because there is no air in space, the rocket carries its own oxygen too.",
      ],
      keyConcept: "A rocket carries both fuel and oxygen because it must burn them where there is no air.",
      instructions: "Look at the large white tank section.",
      position: [1.15, 3.2, 0.5],
    },
    {
      id: "capsule",
      title: "Crew Capsule",
      short: "Where the astronauts travel.",
      detail: [
        "The crew capsule sits at the top. The student astronauts, in their spacesuits, climb aboard through a hatch. It has air, seats, controls and a heat shield for returning to Earth.",
        "On top of many capsules is a launch escape system that can pull the crew away if something goes wrong.",
      ],
      keyConcept: "The capsule is a safe, sealed home for astronauts during the journey.",
      instructions: "Look at the window on the capsule.",
      position: [0.8, 8.9, 0.7],
    },
    {
      id: "lights",
      title: "Mission Control Lights",
      short: "Green means GO.",
      detail: [
        "Mission control checks each system and says GO or NO-GO. All checks must be GO before the countdown can continue.",
        "These lights are a simple way to show the status of fuel, engines and crew.",
      ],
      keyConcept: "A launch only goes ahead when every system is GO.",
      instructions: "Look at the status lights on the stand.",
      position: [6, 2.1, 4],
    },
    {
      id: "pad",
      title: "Launch Tower and Pad",
      short: "Holds the rocket upright until liftoff.",
      detail: [
        "The pad is a strong platform. The tower holds the rocket steady and carries fuel pipes and cables.",
        "A deep trench under the pad guides the hot flames away from the rocket.",
      ],
      keyConcept: "The pad and tower support the rocket until its engines take over.",
      instructions: "Look at the tower beside the rocket.",
      optional: true,
      position: [3.2, 7.5, 0.4],
    },
  ],
};
