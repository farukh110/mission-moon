import type { StageDef } from "../types";

export const training: StageDef = {
  id: "training",
  title: "Astronaut Training",
  summary: "The student crew puts on spacesuits and becomes astronauts.",
  objective: "Watch the students put on their spacesuits.",
  kind: "explore",
  autoAdvance: { seconds: 18, after: "enter" },
  scene: "training",
  story: {
    intro: [
      { ur: "اب خلاباز کی تربیت کا وقت ہے۔ بچے خلائی سوٹ پہن رہے ہیں۔", en: "Now it is time for astronaut training. The students are wearing spacesuits." },
      { ur: "خلائی سوٹ ہمیں ہوا، دباؤ اور حفاظت دیتا ہے۔ ہیلمٹ میں آکسیجن ہوتی ہے۔", en: "A spacesuit gives us air and keeps us safe. The helmet has oxygen." },
      { ur: "خلا میں آواز سفر نہیں کرتی، اس لیے خلاباز ریڈیو کے ذریعے بات کرتے ہیں۔", en: "Sound cannot travel in space, so astronauts talk on the radio." },
    ],
  },
  orbit: { min: 3, max: 18 },
  views: [
    { id: "suit", label: "Spacesuit", position: [0, 3.2, 10], target: [0, 2.1, 0] },
    { id: "helmet", label: "Helmet", position: [1.2, 3.5, 3.8], target: [0, 3.2, 0] },
    { id: "back", label: "Back pack", position: [4, 2.6, -3], target: [0, 2.3, -0.3] },
    { id: "legs", label: "Gloves & boots", position: [2.2, 1.5, 4.5], target: [0, 1.3, 0] },
  ],
  hotspots: [
    {
      id: "helmet",
      title: "Helmet",
      short: "A sealed, pressurized shell for the head.",
      detail: [
        "The helmet is sealed so the astronaut's air cannot leak out. It keeps air pressure around the head and holds breathable oxygen.",
        "The gold visor filters strong sunlight, which is much brighter in space than on Earth.",
      ],
      keyConcept: "A helmet gives a sealed, pressurized space with air to breathe.",
      instructions: "Look at the gold visor and the sealed neck ring.",
      position: [0, 3.35, 0.65],
    },
    {
      id: "oxygen",
      title: "Oxygen Supply",
      short: "The backpack that keeps astronauts breathing.",
      detail: [
        "There is no air to breathe in space or on the Moon. The backpack carries oxygen and sends it into the suit.",
        "It also removes the carbon dioxide that astronauts breathe out.",
      ],
      keyConcept: "Astronauts carry their own oxygen because space has no breathable air.",
      instructions: "Find the backpack on the astronaut's back.",
      position: [0.95, 2.3, -0.3],
    },
    {
      id: "radio",
      title: "Communication Equipment",
      short: "A headset and radio to talk to mission control.",
      detail: [
        "Sound cannot travel through empty space, so astronauts talk by radio. A small headset sits inside the helmet.",
        "Radio lets astronauts talk to each other and to mission control, and send back pictures and data.",
      ],
      keyConcept: "Astronauts use radio to communicate because sound cannot travel through space.",
      instructions: "Find the small antenna beside the helmet.",
      position: [0.6, 3.5, 0],
    },
    {
      id: "suit",
      title: "Pressure Suit",
      short: "A suit that protects the whole body.",
      detail: [
        "A spacesuit has many layers. It keeps pressure on the body, controls temperature and protects against tiny fast space dust.",
        "Without a suit, an astronaut outside could not survive. This is why astronauts wear spacesuits outside their spacecraft.",
      ],
      keyConcept: "A spacesuit provides the conditions the body needs to survive outside.",
      instructions: "Look at the thick layers of the suit.",
      position: [-0.9, 2.5, 0.5],
    },
    {
      id: "gloves",
      title: "Gloves and Boots",
      short: "Protect hands and feet.",
      detail: [
        "Gloves protect hands from very hot and very cold surfaces while still letting astronauts grip tools.",
        "Strong boots protect the feet and help astronauts walk on rough, rocky ground.",
      ],
      keyConcept: "Every part of the body needs protection, including hands and feet.",
      instructions: "Look at the gloves and boots.",
      position: [-0.9, 1.45, 0.2],
    },
  ],
};
