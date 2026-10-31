import type { StoryLine } from "./types";
import type { StationId } from "@/lib/lunar";

/** What is said (Urdu voice) and shown (English subtitle) the first time a student reaches each place. */
export const STATION_STORY: Record<StationId, StoryLine> = {
  craters: {
    ur: "گڑھے۔ یہ پیالے جیسے گڑھے ہیں جو خلائی پتھروں کے چاند سے ٹکرانے سے بنتے ہیں۔ چاند پر ہوا اور بارش نہیں، اس لیے یہ گڑھے اربوں سال تک رہتے ہیں۔",
    en: "Craters. These round pits are made when space rocks hit the Moon. There is no wind or rain, so craters stay for billions of years.",
  },
  rocks: {
    ur: "چاند کے پتھر۔ خلاباز پتھر اور مٹی کے نمونے جمع کرتے ہیں۔ سائنسدان انہیں پڑھ کر جانتے ہیں کہ چاند اور زمین کیسے بنے۔",
    en: "Moon rocks. Astronauts collect rocks and dust. Scientists study them to learn how the Moon was made.",
  },
  ice: {
    ur: "پانی کی برف۔ چاند کے قطبوں کے قریب گہرے گڑھوں میں سورج کی روشنی نہیں پہنچتی۔ سائنسدانوں کا خیال ہے کہ وہاں برف ہو سکتی ہے، جو مستقبل میں انسانوں کے رہنے میں مدد دے سکتی ہے۔",
    en: "Water ice. Some deep craters near the Moon's poles never see the Sun. There may be ice inside. One day it can help people live on the Moon.",
  },
  mountains: {
    ur: "پہاڑ اور وادیاں۔ چاند پر اونچے پہاڑ اور کھلی وادیاں ہیں۔ انہیں دیکھ کر سائنسدان سمجھتے ہیں کہ چاند کی سطح وقت کے ساتھ کیسے بدلی۔",
    en: "Mountains and valleys. The Moon has tall mountains and wide valleys. They show us how the Moon changed over time.",
  },
  experiments: {
    ur: "سائنسی تجربات۔ یہ آلات چاند کی مٹی، درجہ حرارت اور چاند کے زلزلوں یعنی چاند کے اندر ہلکی لرزشوں کو ناپتے ہیں۔ دھوپ میں بہت گرمی اور سائے میں بہت سردی ہوتی ہے۔",
    en: "Science experiments. These tools measure the Moon's soil and heat. They also feel moonquakes, which are small shakes. The Moon is very hot in sunlight and very cold in shadow.",
  },
};

export const ALL_EXPLORED_LINE: StoryLine = {
  ur: "آپ نے چاند کی پانچوں جگہیں دیکھ لیں۔ شاباش!",
  en: "You have visited all five places on the Moon. Well done!",
};

export const STATION_NAMES: Record<StationId, string> = {
  craters: "Craters",
  rocks: "Moon rocks",
  ice: "Water ice",
  mountains: "Mountains & valleys",
  experiments: "Science experiments",
};
