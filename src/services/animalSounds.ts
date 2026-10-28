const sounds: Record<string, string> = {
  Кот: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Meow.ogg",
  Собака: "https://commons.wikimedia.org/wiki/Special:Redirect/file/George_vuf_1996.ogg",
  Корова: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Mudchute_cow_1.ogg",
  Утка: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Ducks_snatching.ogg",
  Овца: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Sheep_bleat.ogg",
  Лошадь: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Wiehern.ogg",
};

let current: HTMLAudioElement | null = null;

export async function playAnimalSound(word: string) {
  const src = sounds[word];
  if (!src) return false;
  current?.pause();
  const audio = new Audio(src);
  current = audio;
  audio.preload = "auto";
  audio.volume = 0.95;
  try {
    await audio.play();
    return true;
  } catch {
    return false;
  }
}

export function stopAnimalSound() {
  current?.pause();
  current = null;
}

export const animalSoundCredits = [
  "Кот — Meow.ogg, Dan Crosby / Wikimedia Commons, CC BY-SA 3.0",
  "Собака — George vuf 1996.ogg, Broadbeer / Wikimedia Commons, public domain",
  "Корова — Mudchute cow 1.ogg, Secretlondon / Wikimedia Commons, CC BY-SA 3.0",
  "Утка — Ducks snatching.ogg, Bert76 / Wikimedia Commons, CC0",
  "Овца — Sheep bleat.ogg, Eviatar Bach / Wikimedia Commons, CC0",
  "Лошадь — Wiehern.ogg, Hü. / Wikimedia Commons, public domain",
];
