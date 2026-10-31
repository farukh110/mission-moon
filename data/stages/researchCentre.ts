import type { StageDef } from "../types";

export const researchCentre: StageDef = {
  id: "research-centre",
  title: "Space Research Centre",
  summary: "See how engineers and scientists prepare a space mission.",
  objective: "Visit every exhibit in the centre.",
  kind: "explore",
  autoAdvance: { seconds: 16, after: "enter" },
  scene: "research",
  story: {
    intro: [
      { ur: "یہ خلائی تحقیقی مرکز ہے۔ یہ پاکستان کے ادارے سپارکو سے متاثر ایک فرضی ماڈل ہے۔", en: "This is the space research centre. It is a model, made up from the idea of Pakistan's space agency, SUPARCO." },
      { ur: "یہاں انجینئر اور سائنسدان خلائی مشن کی تیاری کرتے ہیں۔ مشن کنٹرول زمین سے خلائی جہاز کی نگرانی کرتا ہے۔", en: "Engineers and scientists get space missions ready here. Mission control watches the spacecraft from the ground." },
      { ur: "سیٹلائٹ ہمیں رابطے، راستے کی نشاندہی اور زمین کو دیکھنے میں مدد دیتے ہیں۔", en: "Satellites help us talk to each other, find our way, and look at Earth." },
    ],
  },
  orbit: { min: 4, max: 30 },
  disclaimer:
    "This centre is a fictional model inspired by Pakistan's space agency, SUPARCO. It is not a real SUPARCO mission, and the trip from school is part of the simulation.",
  views: [
    { id: "overview", label: "Centre", position: [0, 7, 19], target: [0, 2.5, -5] },
    { id: "rocket", label: "Rocket", position: [-6, 4, 5], target: [-12, 2.5, -6] },
    { id: "map", label: "Map", position: [0, 5, 3], target: [0, 5, -13] },
    { id: "satellite", label: "Satellite", position: [6, 4, 4], target: [12, 2, -6] },
  ],
  hotspots: [
    {
      id: "mission-control",
      title: "Mission Control Room",
      short: "The team on the ground.",
      detail: [
        "Mission control is a room full of engineers and scientists who watch a spacecraft all the time.",
        "They check its health, send commands by radio, and help the crew make decisions.",
      ],
      keyConcept: "Mission control guides and monitors a spacecraft from the ground.",
      instructions: "Look at the screens. Each one shows different data from the mission.",
      position: [0, 2.6, -3],
    },
    {
      id: "rocket",
      title: "Rocket Display",
      short: "A model of our launch rocket.",
      detail: [
        "Engineers test their ideas on models before building the real rocket.",
        "A rocket is built in sections called stages. Each stage has its own engines and fuel and is dropped when it is empty.",
      ],
      keyConcept: "Rockets are built in stages so they do not carry empty fuel tanks into space.",
      instructions: "Look at the model rocket on its stand.",
      position: [-12, 3.4, -4.6],
    },
    {
      id: "map",
      title: "Earth–Moon Map",
      short: "Planning the route.",
      detail: [
        "The Moon is about 384,400 km from Earth on average. That is about 30 Earth-widths.",
        "Navigators use maps and maths to plan the path, so the spacecraft arrives where the Moon will be, not where it is now.",
      ],
      keyConcept: "Navigation means planning and checking the path of a spacecraft.",
      instructions: "Read the distance on the map.",
      position: [0, 5.2, -12.4],
    },
    {
      id: "satellite",
      title: "Satellite Exhibit",
      short: "Eyes and ears in orbit.",
      detail: [
        "Satellites orbit Earth. Some take pictures of weather, farms and floods. Some help with phones, television and maps.",
        "Space agencies use satellites to study our planet. Solar panels turn sunlight into electricity for them.",
      ],
      keyConcept: "Satellites help with communication, navigation and observing Earth.",
      instructions: "Look at the solar panels and the dish antenna.",
      position: [12, 3.2, -4.6],
    },
    {
      id: "preparation",
      title: "Mission Checklist",
      short: "Prepare before launch.",
      detail: [
        "Before any launch, teams check everything again and again: the rocket, the crew, the weather and the radio links.",
        "If a check fails, the launch waits. Safety always comes before speed.",
      ],
      keyConcept: "Careful checking keeps astronauts safe.",
      instructions: "Read the checklist on the board.",
      position: [-9, 3.3, 5.4],
    },
  ],
};
