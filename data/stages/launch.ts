import type { StageDef } from "../types";

export const launch: StageDef = {
  id: "launch",
  title: "Rocket Launch",
  summary: "Count down, light the engines and climb into space.",
  objective: "Launch the rocket, either with the automatic launch or by flying it yourself.",
  kind: "launch",
  autoAdvance: { seconds: 4, after: "event" },
  scene: "launch",
  story: {
    intro: [
      { ur: "لانچ کی گنتی شروع! گنتی ختم ہونے پر اوپر والی تیر کی کلید دبائے رکھیں تاکہ راکٹ اوپر اٹھے۔", en: "The countdown begins! When it ends, hold the Up arrow key. The rocket will go up." },
    ],
    done: [
      { ur: "ہم خلا میں پہنچ گئے! جیسے جیسے ہوا کم ہوتی ہے، آسمان کالا ہو جاتا ہے۔", en: "We are in space! The air gets thin, and the sky turns black." },
    ],
  },
  disclaimer: "The launch is simplified and sped up so it fits in a lesson.",
  views: [{ id: "pad", label: "Launchpad", position: [10, 5, 24], target: [0, 5, 0] }],
  hotspots: [],
  sequence: {
    countdown: 5,
    duration: 12,
    autoStart: true,
    manualHelp: "Hold the Up arrow (or W) to fire the engines. Left and Right arrows steer. Drag the mouse to look around. Reach space!",
    phases: [
      { until: 1.5, text: "Engine ignition: fuel and oxygen burn and flames shoot out." },
      { until: 5, text: "Liftoff! The crew are inside the capsule. Thrust is now bigger than gravity's pull." },
      { until: 9, text: "Climbing through the atmosphere. The air gets thinner and the sky gets darker." },
      { until: 12, text: "Entering space. There is almost no air up here." },
    ],
    doneTitle: "You are in space!",
    doneText: [
      "The rocket climbed through the atmosphere. As the air got thinner, the sky turned from blue to black.",
      "A real rocket must also tip sideways and reach about 28,000 km/h to stay in orbit around Earth. Going up is not enough.",
    ],
  },
};
