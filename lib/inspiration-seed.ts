export type SeedPost = {
  title: string;
  toolSlug: string;
  lookSlug: string | null;
  imageUrl: string;
  authorHandle: string;
  likes: number;
};

const HANDLES = [
  "thefoxstudio",
  "nadia",
  "9volt",
  "studio_oat",
  "ivan_r",
  "north.st",
  "tomo",
  "peachlight",
  "sunny.day",
  "juno",
  "hexcraft",
  "leo",
  "arc.visuals",
  "greyroom",
  "kolibri",
  "vela",
  "elena.p",
  "marta.wav",
  "brushandbone",
  "mira.k",
];

type SeedGroup = {
  prefix: string;
  count: number;
  title: string;
  toolSlug: string;
  lookSlug: string | null;
};

const GROUPS: SeedGroup[] = [
  { prefix: "gal-noir", count: 3, title: "Film Noir Detective", toolSlug: "photo-studio", lookSlug: "noir" },
  { prefix: "gal-neon", count: 3, title: "Neon Megacity", toolSlug: "photo-studio", lookSlug: "neon-city" },
  { prefix: "gal-golden", count: 3, title: "Golden Hour", toolSlug: "photo-studio", lookSlug: "golden-hour" },
  { prefix: "gal-yearbook", count: 3, title: "Class of 1998", toolSlug: "photo-studio", lookSlug: "yearbook-98" },
  { prefix: "gal-runway", count: 3, title: "Milan Runway", toolSlug: "photo-studio", lookSlug: "runway" },
  { prefix: "gal-street", count: 3, title: "Street Style", toolSlug: "photo-studio", lookSlug: "street-style" },
  { prefix: "gal-elf", count: 3, title: "Elven Lord", toolSlug: "photo-studio", lookSlug: "elf" },
  { prefix: "gal-astro", count: 3, title: "In Orbit", toolSlug: "photo-studio", lookSlug: "astronaut" },
  { prefix: "gal-carpet", count: 2, title: "Red Carpet", toolSlug: "photo-studio", lookSlug: "red-carpet" },
  { prefix: "gal-perfume", count: 3, title: "Perfume flacon on marble", toolSlug: "product-shot", lookSlug: null },
  { prefix: "gal-sneaker", count: 3, title: "Sneaker drop, studio light", toolSlug: "product-shot", lookSlug: null },
  { prefix: "gal-cafe", count: 3, title: "Specialty coffee, warm wood", toolSlug: "product-shot", lookSlug: null },
  { prefix: "gal-surreal", count: 3, title: "Floating islands at dusk", toolSlug: "free-generate", lookSlug: null },
  { prefix: "gal-pet", count: 3, title: "A corgi in a yellow raincoat", toolSlug: "free-generate", lookSlug: null },
  { prefix: "gal-interior", count: 3, title: "Living room in Japandi", toolSlug: "interior-redesign", lookSlug: null },
  { prefix: "gal-headshot", count: 3, title: "Business Headshot", toolSlug: "headshot", lookSlug: null },
];

const LIKE_SEEDS = [412, 287, 653, 194, 528, 341, 776, 233, 465, 158, 604, 379,
  842, 217, 496, 315, 728, 263, 551, 187, 634, 402, 819, 246, 573, 328, 761,
  209, 487, 356, 692, 174, 538, 297, 815, 251, 469, 383, 727, 162, 596, 434,
  308, 675, 221, 512, 149];

export const SEED_POSTS: SeedPost[] = GROUPS.flatMap((group, groupIndex) =>
  Array.from({ length: group.count }, (_, i) => ({
    title: group.title,
    toolSlug: group.toolSlug,
    lookSlug: group.lookSlug,
    imageUrl: `/gallery/${group.prefix}-${i + 1}.webp`,
    authorHandle: HANDLES[(groupIndex * 3 + i * 7) % HANDLES.length],
    likes: LIKE_SEEDS[(groupIndex * 3 + i) % LIKE_SEEDS.length],
  })),
);
