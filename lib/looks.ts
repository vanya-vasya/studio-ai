export type LookCategory =
  | "cinema"
  | "retro"
  | "portrait"
  | "fashion"
  | "adventure"
  | "fantasy";

export type Look = {
  slug: string;
  name: string;
  tagline: string;
  category: LookCategory;
  promptFragment: string;
  previewImage: string;
};

export const LOOK_CATEGORIES: { id: LookCategory; label: string }[] = [
  { id: "cinema", label: "Cinema" },
  { id: "retro", label: "Retro" },
  { id: "portrait", label: "Portrait" },
  { id: "fashion", label: "Fashion" },
  { id: "adventure", label: "Adventure" },
  { id: "fantasy", label: "Fantasy" },
];

export const LOOKS: Look[] = [
  // Cinema
  {
    slug: "noir",
    name: "Film Noir Detective",
    tagline: "Hard light, smoke, blinds",
    category: "cinema",
    promptFragment:
      "a 1940s film noir detective scene: hard dramatic side light, cigarette smoke in the air, shadows of venetian blinds across the face, fedora hat and trench coat, moody black-and-white cinematography with deep contrast",
    previewImage: "/covers/preset-noir.webp",
  },
  {
    slug: "neon-city",
    name: "Neon Megacity",
    tagline: "Rain and signage in reflections",
    category: "cinema",
    promptFragment:
      "a cyberpunk neon megacity at night: rain-soaked streets, glowing neon signage reflected on wet skin and clothing, cinematic teal-and-magenta palette, shallow depth of field, blade-runner atmosphere",
    previewImage: "/covers/preset-neon-city.webp",
  },
  {
    slug: "wild-west",
    name: "Wild West",
    tagline: "Dust, a hat and sunset",
    category: "cinema",
    promptFragment:
      "a western movie scene at sunset: dusty golden air, cowboy hat, weathered leather and denim, warm low sun flaring into the lens, wide desert town backdrop, gritty cinematic film look",
    previewImage: "/covers/preset-western.webp",
  },
  {
    slug: "family-business",
    name: "Family Business",
    tagline: "A dark study and whiskey",
    category: "cinema",
    promptFragment:
      "a mafia drama portrait in a dark wood-panelled study: leather armchair, a glass of whiskey, warm tungsten lamp light, pinstripe tailoring, heavy shadows and a quiet air of power, cinematic 1970s grade",
    previewImage: "/covers/preset-mafia.webp",
  },
  // Retro
  {
    slug: "yearbook-98",
    name: "Class of 1998",
    tagline: "That very yearbook portrait",
    category: "retro",
    promptFragment:
      "a 1998 school yearbook studio portrait: laser-beam blue-grey studio backdrop, soft even flash, slightly awkward smile framing, 90s haircut and knitwear, authentic scanned-print colour cast",
    previewImage: "/covers/preset-yearbook-98.webp",
  },
  {
    slug: "polaroid-70s",
    name: "70s Polaroid",
    tagline: "Warm grain and fading",
    category: "retro",
    promptFragment:
      "an authentic 1970s polaroid snapshot: warm faded colours, soft focus, gentle vignetting and chemical grain, homely instant-film feel, white polaroid frame border, sun-washed interior",
    previewImage: "/covers/preset-polaroid-70.webp",
  },
  {
    slug: "disco-80s",
    name: "80s Disco",
    tagline: "Glitter, softbox and hairspray",
    category: "retro",
    promptFragment:
      "a 1980s disco studio portrait: glitter and haze, big permed hair with hairspray shine, saturated magenta-and-cyan gel lighting, softbox catchlights, metallic outfit, glam 80s album-cover energy",
    previewImage: "/covers/preset-disco-80.webp",
  },
  {
    slug: "film-60s",
    name: "60s Film",
    tagline: "Soft contrast, warm archive",
    category: "retro",
    promptFragment:
      "a 1960s archival film photograph: soft warm contrast, muted kodachrome palette, period-correct styling and hair, natural window light, gentle grain, timeless documentary framing",
    previewImage: "/covers/preset-film-60.webp",
  },
  // Portrait
  {
    slug: "bw-studio",
    name: "Black & White Studio",
    tagline: "A classic portrait on film",
    category: "portrait",
    promptFragment:
      "a classic black-and-white studio portrait on film: clean dark backdrop, sculpted key light with soft fill, rich tonal range from deep black to bright highlight, medium-format film grain, timeless and dignified",
    previewImage: "/covers/preset-studio-bw.webp",
  },
  {
    slug: "rembrandt",
    name: "Rembrandt Light",
    tagline: "The painterly triangle of light",
    category: "portrait",
    promptFragment:
      "a painterly portrait lit with classic Rembrandt lighting: the signature triangle of light on the shadowed cheek, deep warm chiaroscuro, dark umber background, old-master oil painting mood rendered photographically",
    previewImage: "/covers/preset-rembrandt.webp",
  },
  {
    slug: "golden-hour",
    name: "Golden Hour",
    tagline: "Sun straight into the lens",
    category: "portrait",
    promptFragment:
      "a golden hour portrait outdoors: low warm sun flaring straight into the lens, glowing rim light in the hair, soft amber haze, dreamy bokeh, honest natural skin and a relaxed expression",
    previewImage: "/covers/preset-golden-hour.webp",
  },
  {
    slug: "magazine-cover",
    name: "Magazine Cover",
    tagline: "Clean light and a confident gaze",
    category: "portrait",
    promptFragment:
      "a premium magazine cover portrait: clean beauty-dish lighting, flawless yet natural retouch, confident direct gaze, neutral studio backdrop, crisp editorial styling, space at the top as if for a masthead",
    previewImage: "/covers/preset-editorial.webp",
  },
  // Fashion
  {
    slug: "runway",
    name: "Milan Runway",
    tagline: "The show, flashes, motion",
    category: "fashion",
    promptFragment:
      "a Milan fashion week runway shot: the subject mid-stride on the catwalk, paparazzi flashes freezing motion, high-fashion tailoring, glossy floor reflections, dark audience bokeh behind",
    previewImage: "/covers/preset-runway.webp",
  },
  {
    slug: "street-style",
    name: "Street Style",
    tagline: "The city on a 35mm lens",
    category: "fashion",
    promptFragment:
      "an off-duty street style photograph on a 35mm lens: candid stride across a city crosswalk, layered contemporary outfit, soft overcast light, background of taxis and storefronts in gentle blur",
    previewImage: "/covers/preset-street-style.webp",
  },
  {
    slug: "desert-editorial",
    name: "Desert Editorial",
    tagline: "Dunes and wind in the fabric",
    category: "fashion",
    promptFragment:
      "a high-fashion desert editorial: sweeping dunes, wind catching long flowing fabric, warm sand tones against a pale sky, dramatic figure-in-landscape composition, vogue-style art direction",
    previewImage: "/covers/preset-desert-editorial.webp",
  },
  {
    slug: "red-carpet",
    name: "Red Carpet",
    tagline: "A premiere and paparazzi flashes",
    category: "fashion",
    promptFragment:
      "a movie premiere red carpet moment: formal evening wear, step-and-repeat wall softly out of focus, a burst of paparazzi flashes, confident pose, glossy celebrity-press photography",
    previewImage: "/covers/preset-red-carpet.webp",
  },
  // Adventure
  {
    slug: "formula-1",
    name: "Formula 1 Driver",
    tagline: "Race suit, pit lane, adrenaline",
    category: "adventure",
    promptFragment:
      "a Formula 1 driver portrait in the pit lane: race suit with sponsor patches, helmet under one arm, heat shimmer and pit crew activity behind, crisp motorsport-press lighting, adrenaline and focus",
    previewImage: "/covers/preset-formula.webp",
  },
  {
    slug: "ascent",
    name: "The Ascent",
    tagline: "Wind, ice and altitude",
    category: "adventure",
    promptFragment:
      "a high-altitude mountaineering portrait: ice crystals on the jacket hood, rope and carabiners, wind-driven snow, vast glacier and peaks behind, cold blue light with a determined expression",
    previewImage: "/covers/preset-alpinist.webp",
  },
  {
    slug: "fighter-pilot",
    name: "Fighter Pilot",
    tagline: "Cockpit, helmet, runway",
    category: "adventure",
    promptFragment:
      "a fighter pilot portrait by the jet on the runway: flight suit and helmet with reflective visor lifted, heat haze over tarmac, aircraft canopy and fuselage behind, cinematic military-aviation grade",
    previewImage: "/covers/preset-pilot.webp",
  },
  {
    slug: "underwater",
    name: "Underwater",
    tagline: "Light rays through the water",
    category: "adventure",
    promptFragment:
      "an underwater portrait: shafts of sunlight cutting through clear blue water, suspended bubbles, hair and fabric floating weightlessly, serene expression, ethereal aquatic light",
    previewImage: "/covers/preset-diver.webp",
  },
  // Fantasy
  {
    slug: "elf",
    name: "Elven Lord",
    tagline: "Forest, silver and mist",
    category: "fantasy",
    promptFragment:
      "a high-fantasy elven noble portrait: pointed ears, ornate silver circlet and embroidered robes, ancient misty forest behind, cool ethereal light, painterly fantasy-film production value",
    previewImage: "/covers/preset-elf.webp",
  },
  {
    slug: "cyber-samurai",
    name: "Cyber Samurai",
    tagline: "Armour, neon and rain",
    category: "fantasy",
    promptFragment:
      "a cyberpunk samurai portrait: futuristic lacquered armour with glowing circuit accents, katana hilt over the shoulder, neon kanji signs and rain in the night city behind, dramatic rim light",
    previewImage: "/covers/preset-cyber-samurai.webp",
  },
  {
    slug: "royal-portrait",
    name: "Royal Portrait",
    tagline: "Oil paint, brocade, candlelight",
    category: "fantasy",
    promptFragment:
      "a regal oil-painting style royal portrait: brocade and ermine, jewelled crown or collar, candlelit palace interior, rich renaissance palette, visible painterly brushwork, museum-piece gravitas",
    previewImage: "/covers/preset-royal.webp",
  },
  {
    slug: "astronaut",
    name: "In Orbit",
    tagline: "A spacesuit and Earth in the visor",
    category: "fantasy",
    promptFragment:
      "an astronaut portrait in orbit: detailed spacesuit with mission patches, helmet visor reflecting the blue Earth, station interior or open space behind, crisp NASA-documentary realism",
    previewImage: "/covers/preset-astronaut.webp",
  },
];

export const getLook = (slug: string): Look | undefined =>
  LOOKS.find((look) => look.slug === slug);
