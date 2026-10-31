import type { StageDef } from "../types";

export const MOON_DISTANCE_KM = 384_400;
/** Real Moon trips take about three days. */
export const JOURNEY_HOURS = 72;
export const JOURNEY_SECONDS = 45;

export interface JourneyCard {
  at: number;
  title: string;
  text: string;
}

export const JOURNEY_CARDS: JourneyCard[] = [
  {
    at: 0,
    title: "Leaving Earth orbit",
    text: "The rocket engine burns for a few minutes. It pushes our spacecraft away from Earth, toward the Moon.",
  },
  {
    at: 0.25,
    title: "Earth gets smaller",
    text: "The farther we go, the smaller Earth looks. Earth's gravity still pulls us, so we slow down a little.",
  },
  {
    at: 0.5,
    title: "Halfway there",
    text: "Radio signals are very fast. Still, they take about one and a half seconds to reach the Moon.",
  },
  {
    at: 0.8,
    title: "The Moon grows",
    text: "The Moon looks bigger every hour. Its gravity starts to pull us, so we check our path carefully.",
  },
  {
    at: 1,
    title: "Arrival at the Moon",
    text: "The Moon is about 384,400 kilometres from Earth. Real trips take about three days. Now, let us land.",
  },
];

export const journey: StageDef = {
  id: "journey",
  title: "Journey to the Moon",
  summary: "Travel from Earth to the Moon and watch the view change.",
  objective: "Travel all the way to the Moon.",
  kind: "journey",
  autoAdvance: { seconds: 4, after: "event" },
  scene: "journey",
  story: {
    intro: [
      { ur: "اب ہم زمین سے چاند کی طرف جا رہے ہیں۔ چاند زمین سے تقریباً تین لاکھ چوراسی ہزار کلومیٹر دور ہے۔", en: "Now we are going from Earth to the Moon. The Moon is about 384,400 kilometres away." },
    ],
  },
  disclaimer: "This is a simplified, sped-up journey. Distances and times are for learning, not exact.",
  views: [{ id: "chase", label: "Rocket", position: [3.6, 1.9, 8.6], target: [0, 0.3, -3.5] }],
  hotspots: [],
};

/** The same five cards in Urdu, spoken when each card appears. */
export const JOURNEY_URDU: string[] = [
  "زمین کے مدار سے روانگی۔ انجن چند منٹ جلتا ہے تاکہ خلائی جہاز چاند کی طرف بڑھے۔",
  "زمین چھوٹی ہوتی جا رہی ہے۔ زمین کی کشش اب بھی کھینچ رہی ہے، اس لیے رفتار آہستہ آہستہ کم ہوتی ہے۔",
  "آدھا راستہ طے ہو گیا۔ ریڈیو سگنل روشنی کی رفتار سے چلتا ہے، پھر بھی چاند تک پہنچنے میں تقریباً سوا سیکنڈ لگتا ہے۔",
  "چاند بڑا ہوتا جا رہا ہے، اور اب اس کی اپنی کشش بھی کھینچنے لگی ہے۔",
  "ہم چاند پر پہنچ گئے! اصل مشن میں یہ سفر تقریباً تین دن کا ہوتا ہے۔",
];
