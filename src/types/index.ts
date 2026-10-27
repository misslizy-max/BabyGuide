export type EventKind =
  | "Момент"
  | "Навык"
  | "Первое слово"
  | "Еда"
  | "Смесь"
  | "Сон"
  | "Температура"
  | "Лекарство"
  | "Рост";
export interface Profile {
  name: string;
  birth: string;
  sex: "girl" | "boy";
  country: string;
  city: string;
  region: string;
  feeding: string;
  allergies: string[];
  excluded: string[];
  introduced: string[];
  favorites: string[];
  dislikes: string[];
  skills: string[];
  notes: string;
  toy: string;
  pantry: string[];
  season: "auto" | "winter" | "spring" | "summer" | "autumn";
}
export interface City {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  countryCode?: string;
  region?: string;
}
export interface JournalEvent {
  id: string;
  kind: EventKind;
  time: string;
  text: string;
  end?: string;
  quality?: string;
  temperature?: number;
  method?: string;
  medicine?: string;
  weight?: number;
  height?: number;
  head?: number;
  word?: string;
  audioId?: string;
  amount?: number;
}
export interface Reminder {
  id: string;
  text: string;
  date: string;
  done: boolean;
}
export interface AppData {
  version: 2;
  profile: Profile;
  events: JournalEvent[];
  favorites: string[];
  menuDone: number[];
  city: City | null;
  travelCity: City | null;
  menuPlan: string[];
  practice: Record<string, number[]>;
  reminders: Reminder[];
}
export interface Ingredient {
  id: string;
  name: string;
  grams: number;
  unit?: string;
}
export interface Recipe {
  id: string;
  name: string;
  icon: string;
  slot: "breakfast" | "lunch" | "snack" | "dinner";
  minAge: number;
  minutes: number;
  ingredients: Ingredient[];
  allergens: string[];
  steps: string[];
  texture: string;
  serving: string;
  substitutions: string;
  regions: string[];
  seasons: string[];
  vegetarian: boolean;
}
export interface Game {
  id: string;
  title: string;
  min: number;
  max: number;
  category: string;
  minutes: number;
  level: string;
  material: string;
  icon: string;
  goal: string;
  prep: string;
  steps: string[];
  safety: string;
}
export interface Reading {
  id: string;
  title: string;
  category: string;
  age: string;
  lead: string;
  blocks: string[][];
  source?: number;
}
export interface Guide {
  id: string;
  title: string;
  category: string;
  min: number;
  lead: string;
  what: string;
  why: string;
  ages: string;
  assess: string;
  steps: string[];
  today: string;
  tomorrow: string;
  practice: string[];
  errors: string;
  fallback: string;
  doctor: string;
  sources: string[];
}
export interface Rhyme {
  id: string;
  title: string;
  text: string;
  movement: string[];
  when: string;
  goal: string;
  icon: string;
}
export interface Story {
  id: string;
  title: string;
  topic: string;
  icon: string;
  paragraphs: string[];
  question: string;
}
export interface LearningCard {
  id: string;
  word: string;
  category: string;
  icon: string;
  sound?: string;
}
