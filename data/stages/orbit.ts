import type { StageDef } from "../types";

export const orbit: StageDef = {
  id: "orbit",
  title: "Earth Orbit",
  summary: "See Earth from space and learn what an orbit is.",
  objective: "Inspect Earth, the atmosphere and the spacecraft.",
  kind: "explore",
  autoAdvance: { seconds: 14, after: "enter" },
  scene: "orbit",
  story: {
    intro: [
      { ur: "ہم زمین کے مدار میں ہیں۔ مدار وہ خمدار راستہ ہے جس پر کشش ثقل کی وجہ سے خلائی جہاز زمین کے گرد گھومتا ہے۔", en: "We are in orbit around Earth. An orbit is a round path around Earth. Gravity keeps us on it." },
      { ur: "خلاباز اس لیے تیرتے ہیں کہ وہ خلائی جہاز کے ساتھ مسلسل زمین کے گرد گر رہے ہوتے ہیں۔ وہاں کشش ثقل ختم نہیں ہوتی۔", en: "Astronauts float because they are always falling around Earth, together with the spacecraft. Gravity is still there." },
    ],
  },
  orbit: { min: 4, max: 30 },
  views: [
    { id: "overview", label: "Orbit", position: [0, 1, 12], target: [0, -4, -4] },
    { id: "craft", label: "Spacecraft", position: [6, 2, 8], target: [4, 0, -1] },
    { id: "horizon", label: "Horizon", position: [-6, -3, 6], target: [-8, -6, -6] },
  ],
  hotspots: [
    {
      id: "earth",
      title: "Earth from Space",
      short: "A curved blue world.",
      detail: [
        "From space you can see that Earth is round. Oceans look blue, clouds look white, and land looks green and brown.",
        "There are no lines between countries. Astronauts often say it makes the planet feel small and special.",
      ],
      keyConcept: "From orbit, Earth looks like a round blue ball with white clouds.",
      instructions: "Look at the curve of the planet.",
      position: [-4.2, -5, -4],
    },
    {
      id: "atmosphere",
      title: "Thin Blue Line",
      short: "The atmosphere seen from the side.",
      detail: [
        "Seen from orbit, the atmosphere is a very thin blue glow along the edge of Earth.",
        "Almost all of the air is within about 10 km of the ground. Space begins about 100 km up.",
      ],
      keyConcept: "The atmosphere is very thin compared with the size of Earth.",
      instructions: "Find the blue glow at the edge of Earth.",
      position: [-8.6, -8.4, -6],
    },
    {
      id: "craft",
      title: "Our Rocket and Crew",
      short: "Flying around Earth.",
      detail: [
        "Our rocket, with the astronaut crew inside, is in orbit. An orbit is a curved path around a planet. It happens because gravity keeps pulling the spacecraft toward Earth while it moves sideways very fast.",
        "The spacecraft is always falling toward Earth, but it moves sideways so fast that it keeps missing the ground. This is called free fall.",
        "Astronauts inside float because they are falling together with the spacecraft. Gravity has not switched off. They only seem weightless.",
        "The spacecraft uses antennas to send radio signals to mission control and receive commands.",
      ],
      keyConcept: "In orbit, a spacecraft is falling around Earth. Astronauts float because they fall together with it.",
      instructions: "Click the dot that moves with the spacecraft.",
      position: [0, 1.2, 0],
    },
  ],
};
