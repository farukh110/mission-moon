import type { StageDef } from "../types";

export const taxi: StageDef = {
  id: "taxi",
  title: "Taxi to the Research Centre",
  summary: "The student crew rides a taxi from school to the space research centre.",
  objective: "Take the student crew to the research centre by taxi: watch the ride or drive it yourself.",
  kind: "taxi",
  autoAdvance: { seconds: 3, after: "event" },
  scene: "road",
  story: {
    intro: [
      { ur: "اب ہم ٹیکسی میں دو کلومیٹر دور خلائی تحقیقی مرکز جا رہے ہیں۔ ٹیکسی چلانے کے لیے اوپر والی تیر کی کلید دبائے رکھیں۔ گیٹ پر گارڈ ہمیں چیک کریں گے۔", en: "Now we go to the space research centre by taxi. It is 2 kilometres away. Hold the Up arrow key to drive, and use Left and Right to steer. The guards at the gate will check us." },
    ],
    done: [
      { ur: "ہم خلائی تحقیقی مرکز پہنچ گئے!", en: "We have reached the space research centre!" },
    ],
  },
  disclaimer:
    "This taxi ride is part of the simulation. The school and the centre are fictional models, and the centre is only inspired by SUPARCO.",
  views: [{ id: "road", label: "Road", position: [-58, 4.2, 2.5], target: [-46, 1.5, -3.2] }],
  hotspots: [],
  sequence: {
    countdown: 0,
    duration: 10,
    autoStart: true,
    manualHelp: "Hold Up (or W) to drive, Down (or S) to brake, Left and Right (or A and D) to steer, and Space to honk. Watch out for the other vehicles. The research centre is 2 km away, and the guards at its gate will check your taxi.",
    phases: [
      { until: 3, text: "The student crew leaves GBLSS Ghulam Muhammad Village in Malir and sets off in a yellow taxi." },
      { until: 7, text: "Driving to the space research centre. The guards check every car at the gate." },
      { until: 10, text: "Arriving at the space research centre." },
    ],
    doneTitle: "We have arrived!",
    doneText: [
      "The student crew has reached the space research centre.",
      "In this simulation the ride is just an animation. Next, find out how engineers and scientists prepare a space mission.",
    ],
  },
};
