import type { StageDef } from "../types";

export const school: StageDef = {
  id: "school",
  title: "GBLSS Ghulam Muhammad Village, Malir",
  summary: "Our mission starts at GBLSS Ghulam Muhammad Village, with a briefing from mission control.",
  objective: "Explore the school and read the mission briefing.",
  kind: "explore",
  autoAdvance: { seconds: 16, after: "enter" },
  scene: "school",
  story: {
    intro: [
      { ur: "مشن مون میں خوش آمدید! ہم جی بی ایل ایس ایس غلام محمد ولیج، ملیر میں ہیں۔", en: "Welcome to Mission Moon! We are at GBLSS Ghulam Muhammad Village in Malir." },
      { ur: "آج ہم خلا کا ایک خیالی سفر کریں گے۔ یہ ایک سمولیشن ہے، مگر اس میں سائنس سچی ہے۔", en: "Today we will go on a pretend trip to space. It is a game, but the science is real." },
      { ur: "ہر خلائی مشن کی شروعات سیکھنے سے ہوتی ہے۔", en: "Every space mission starts with learning." },
    ],
  },
  orbit: { min: 4, max: 70 },
  disclaimer: "This is a made-up model of GBLSS Ghulam Muhammad Village in Malir, Karachi. It is not an exact copy of the real school.",
  views: [
    { id: "overview", label: "School", position: [-4, 6.5, 29.5], target: [0, 3.5, 0] },
    { id: "board", label: "Briefing board", position: [-3, 3.5, 18], target: [-3.5, 2.5, 9.5] },
    { id: "telescope", label: "Telescope", position: [-7, 2.8, 17], target: [-7, 1.6, 10] },
  ],
  hotspots: [
    {
      id: "school",
      title: "GBLSS Ghulam Muhammad Village",
      short: "Our school in Malir, where every mission begins.",
      detail: [
        "This is a model of our school, GBLSS Ghulam Muhammad Village in Malir, Karachi. It is a made-up version, not an exact copy.",
        "Every space mission starts with people who studied science, maths and technology at school.",
      ],
      keyConcept: "Every space mission begins with learning.",
      instructions: "Look at the school building, then find the other glowing dots.",
      position: [0, 6.6, -4.5],
    },
    {
      id: "trainees",
      title: "Astronaut Trainees",
      short: "Our class is the crew today.",
      detail: [
        "In this game, you and your classmates are astronaut trainees.",
        "Real astronauts are trained scientists and engineers. They fly spacecraft, run experiments, fix equipment and share what they discover.",
      ],
      keyConcept: "Astronauts are trained scientists and engineers who work as a team.",
      instructions: "Read about what astronauts do.",
      position: [1.8, 2.3, 3.2],
    },
    {
      id: "board",
      title: "Mission Briefing Board",
      short: "Today's plan.",
      detail: [
        "Your mission: take a simulated journey to the Moon. You will visit a space research centre, train as an astronaut, launch a rocket, orbit Earth, travel to the Moon and land.",
        "This is a simulation made for learning. You are not really travelling from school to a launch site. The science you learn is real.",
      ],
      keyConcept: "Mission Moon is a simulation made for learning.",
      instructions: "Read the plan carefully.",
      position: [7.5, 3.9, 3.4],
    },
    {
      id: "telescope",
      title: "Telescope",
      short: "Observing the sky.",
      detail: [
        "A telescope collects light from far away so we can see the Moon, planets and stars more clearly.",
        "People watched the Moon for thousands of years before rockets were invented. Careful observation is how we begin to understand space.",
        "Safety: never look at the Sun through a telescope. It can badly damage your eyes.",
      ],
      keyConcept: "Careful observation is how we begin to understand space.",
      instructions: "Imagine looking at the Moon through this telescope.",
      position: [-5, 2.7, 5.4],
    },
  ],
};
