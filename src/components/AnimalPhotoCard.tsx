const photos: Record<string, { src: string; alt: string }> = {
  Кот: {
    src: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Meowing_Cat.jpg?width=1200",
    alt: "Настоящий кот",
  },
  Собака: {
    src: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Pet_animal_photography.jpg?width=1200",
    alt: "Настоящая собака",
  },
  Корова: {
    src: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Sitting_cow.jpg?width=1200",
    alt: "Настоящая корова",
  },
  Утка: {
    src: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Walking_duck.jpg?width=1200",
    alt: "Настоящая утка",
  },
  Овца: {
    src: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Sheep_in_a_pen.jpg?width=1200",
    alt: "Настоящая овца",
  },
  Лошадь: {
    src: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Horse_in_a_pen.jpg?width=1200",
    alt: "Настоящая лошадь",
  },
};

export function AnimalPhotoCard({ word }: { word: string }) {
  const photo = photos[word];
  if (!photo) return null;
  return (
    <figure className="animal-photo-card">
      <img src={photo.src} alt={photo.alt} loading="eager" referrerPolicy="no-referrer" />
      <figcaption>{word}</figcaption>
    </figure>
  );
}
