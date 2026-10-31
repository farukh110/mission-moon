import type { StageDef, ViewDef } from "../types";

/** On the surface, "views" are waypoints: the astronaut walks there. */
const WAYPOINTS: ViewDef[] = [
  { id: "lander", label: "Rocket", position: [-2, 4, 14], target: [4, 1, 4], walkTo: [3, 0, 4.5] },
  { id: "rocks", label: "Rocks", position: [-2, 4, 14], target: [4, 1, 4], walkTo: [-4.5, 0, 5] },
  { id: "crater", label: "Crater rim", position: [-2, 4, 14], target: [4, 1, 4], walkTo: [9, 0, -5.5] },
];

export const landing: StageDef = {
  id: "landing",
  title: "Moon Landing",
  summary: "Land safely, then explore a small area of the Moon.",
  objective: "Land the spacecraft, then explore five places on the Moon.",
  kind: "landing",
  autoAdvance: { seconds: 300, after: "event" },
  scene: "lunar",
  story: {
    intro: [
      { ur: "ہم چاند پر اتر رہے ہیں۔ چاند پر ہوا نہیں، اس لیے راکٹ کا انجن نیچے کی طرف جل کر رفتار کم کرتا ہے۔", en: "We are landing on the Moon. There is no air, so the rocket engine pushes down to slow us." },
    ],
    done: [
      { ur: "ہم چاند پر پہنچ گئے! چاند کی کشش ثقل زمین کی تقریباً چھٹا حصہ ہے، اسی لیے ہم اونچی چھلانگ لگا سکتے ہیں۔", en: "We have landed on the Moon! Moon gravity is much weaker than Earth's, so we can jump high." },
      { ur: "یہاں سانس لینے کے لیے ہوا نہیں، اس لیے خلائی سوٹ ضروری ہے۔ آسمان دن میں بھی کالا ہے۔", en: "There is no air to breathe here, so we need spacesuits. The sky is black, even in the day." },
      { ur: "اب تیر کی کلیدوں سے چلیں اور چاند کی پانچ جگہیں دیکھیں۔ چمکتی ہوئی روشنی کی طرف جائیں۔", en: "Now use the arrow keys to walk. Visit the five places on the Moon. Go to the glowing lights." },
    ],
  },
  walk: true,
  hint: "Arrow keys move · Space jumps · Tab switches student · Walk to the glowing places",
  orbit: { min: 4, max: 22 },
  disclaimer: "The landing is simplified. Real landings take hours and need very careful navigation.",
  views: [
    { id: "landing", label: "Landing view", position: [-16, 10, 28], target: [0, 13, 0] },
    ...WAYPOINTS,
  ],
  hotspots: [
    {
      id: "lander",
      title: "Our Rocket on the Moon",
      short: "The rocket that brought us here.",
      detail: [
        "Our rocket fired its engine to slow down. In space there is no air to slow it, so it used rocket thrust pointing downward.",
        "Landing slowly lets it touch down safely. The wide legs spread its weight so it does not sink or tip over. Our crew of astronauts is inside.",
      ],
      keyConcept: "A rocket uses engine thrust to slow down because there is no air to help.",
      instructions: "Look at the legs and the engine under the rocket.",
      position: [0, 5.6, 0],
    },
    {
      id: "astronaut",
      title: "Astronaut on the Moon",
      short: "Weaker gravity, no air.",
      detail: [
        "The Moon's gravity is about one sixth of Earth's. An astronaut weighs about one sixth as much, so walking looks bouncy.",
        "The Moon has almost no air, so astronauts cannot breathe there. They wear spacesuits with oxygen, and the suit also protects them from very hot sunlight and very cold shadows.",
      ],
      keyConcept: "Moon gravity is weaker, not zero, and there is no breathable air, so spacesuits are essential.",
      instructions: "Move with W A S D. Notice the small hops.",
      position: [0, 2.6, 0],
    },
    {
      id: "crater",
      title: "A Lunar Crater",
      short: "A bowl made by an impact.",
      detail: [
        "Craters are bowl-shaped holes made when space rocks crash into the Moon at very high speed.",
        "The Moon has no thick air and almost no weather, so old craters stay for billions of years.",
      ],
      keyConcept: "Craters are impact marks, and they last because the Moon has no weather to erase them.",
      instructions: "Walk to the crater rim and look into the bowl.",
      position: [12, 1.8, -8],
    },
    {
      id: "rock",
      title: "Moon Rock",
      short: "Rock and dust.",
      detail: [
        "The surface is covered with grey dust and broken rock called regolith. It formed over billions of years from impacts.",
        "Scientists study Moon rocks to learn how the Moon and Earth formed.",
      ],
      keyConcept: "Moon rocks tell scientists about the history of the Moon and Earth.",
      instructions: "Look closely at the large boulder.",
      position: [-6, 2.2, 2],
    },
    {
      id: "earth",
      title: "Earth in the Sky",
      short: "Our home, seen from the Moon.",
      detail: [
        "From the Moon, Earth looks like a bright blue and white ball in the sky.",
        "It seems to stay in nearly the same place in the Moon's sky, because the Moon always shows the same face to Earth.",
      ],
      keyConcept: "Earth looks like a blue and white ball when seen from the Moon.",
      instructions: "Look up at the blue ball in the sky.",
      position: [-70, 46, -110],
    },
    {
      id: "sky",
      title: "The Black Sky",
      short: "No blue daytime sky here.",
      detail: [
        "On Earth the sky is blue because air scatters sunlight. The Moon has almost no air, so there is nothing to scatter the light.",
        "That is why the sky is black even when the Sun is shining and the ground is bright.",
      ],
      keyConcept: "The Moon's sky is black in the daytime because there is almost no air to scatter sunlight.",
      instructions: "Look at the sky above the horizon.",
      position: [30, 22, -60],
    },
  ],
  sequence: {
    countdown: 0,
    duration: 10,
    autoStart: true,
    phases: [
      { until: 3, text: "Descending. The engine fires downward to slow us." },
      { until: 7, text: "Slowing down. We must touch down gently." },
      { until: 10, text: "Touchdown! Lunar dust blows away from the engine." },
    ],
    doneTitle: "We have landed!",
    doneText: [
      "The rocket used its engine to slow down, because the Moon has no air to help.",
      "Now explore! Walk with the arrow keys and visit the five glowing places: craters, Moon rocks, water ice, mountains and science experiments.",
    ],
  },
};
