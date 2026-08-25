import { getLook } from "@/lib/looks";

export type CategoryId =
  | "people"
  | "products"
  | "spaces"
  | "editing"
  | "text-voice";

export type Category = {
  id: CategoryId;
  name: string;
  description: string;
};

export const CATEGORIES: Category[] = [
  {
    id: "people",
    name: "People & Portrait",
    description: "Looks, headshots, restoration and fitting",
  },
  {
    id: "products",
    name: "Products & Business",
    description: "Listings, backgrounds, banners and logos",
  },
  { id: "spaces", name: "Spaces", description: "Interiors, staging and facades" },
  {
    id: "editing",
    name: "Frame Editing",
    description: "Brush, expansion and free generation",
  },
  {
    id: "text-voice",
    name: "Text & Voice",
    description: "Descriptions, voiceover and transcription",
  },
];

export type FileInput = {
  id: string;
  label: string;
  required: boolean;
  accept: string;
  note: string;
};

export type Control =
  | {
      kind: "select";
      id: string;
      label: string;
      options: string[];
      defaultValue?: string;
    }
  | {
      kind: "text";
      id: string;
      label: string;
      placeholder?: string;
      optional?: boolean;
    }
  | {
      kind: "textarea";
      id: string;
      label: string;
      placeholder?: string;
      maxLength?: number;
      examples?: string[];
      optional?: boolean;
    }
  | { kind: "switch"; id: string; label: string; defaultOn?: boolean }
  | { kind: "brushMask"; id: string; label: string }
  | { kind: "lookPicker"; id: string; label: string };

export type ToolParams = Record<string, string>;

export type ToolConfig = {
  slug: string;
  name: string;
  tagline: string;
  category: CategoryId;
  price: number;
  popular?: boolean;
  output: { kind: "image" | "text" | "audio"; frames?: number };
  /** aspect for generated images; may be overridden by a "format" param */
  size?: "1024x1024" | "1536x1024" | "1024x1536";
  inputs: FileInput[];
  controls: Control[];
  cover: string;
  systemPrompt: (params: ToolParams) => string;
};

const FORMAT_SIZES: Record<string, "1024x1024" | "1536x1024" | "1024x1536"> = {
  "Square 1:1": "1024x1024",
  "Landscape 3:2": "1536x1024",
  "Portrait 2:3": "1024x1536",
};

export const sizeForFormat = (
  format: string | undefined,
  fallback: "1024x1024" | "1536x1024" | "1024x1536" = "1024x1024",
) => (format && FORMAT_SIZES[format]) || fallback;

export const TOOLS: ToolConfig[] = [
  // ── People & Portrait ────────────────────────────────────────────────
  {
    slug: "photo-studio",
    name: "Photo Studio",
    tagline: "24 looks in one click",
    category: "people",
    price: 8,
    popular: true,
    output: { kind: "image", frames: 4 },
    size: "1024x1536",
    inputs: [
      {
        id: "photo",
        label: "Your photo",
        required: true,
        accept: "image/*",
        note: "A close-up portrait with the face clearly visible",
      },
    ],
    controls: [{ kind: "lookPicker", id: "look", label: "Pick a look" }],
    cover: "/covers/tool-photo-studio.webp",
    systemPrompt: (p) => {
      const look = getLook(p.look ?? "");
      return `Transform the uploaded portrait into ${look?.promptFragment ?? "a professional studio portrait"}. Keep the person's face fully recognizable — same facial features, same identity. Photorealistic quality, flattering framing.`;
    },
  },
  {
    slug: "headshot",
    name: "Business Headshot",
    tagline: "A portrait for your resume and LinkedIn",
    category: "people",
    price: 2,
    popular: true,
    output: { kind: "image", frames: 1 },
    size: "1024x1536",
    inputs: [
      {
        id: "photo",
        label: "Your photo",
        required: true,
        accept: "image/*",
        note: "A close-up portrait with the face clearly visible",
      },
    ],
    controls: [
      {
        kind: "select",
        id: "style",
        label: "Style",
        options: ["Corporate", "Startup relaxed", "Creative", "Academic"],
      },
      {
        kind: "select",
        id: "background",
        label: "Background",
        options: ["Grey gradient", "Clean white", "Blurred office", "Dark graphite"],
      },
      {
        kind: "switch",
        id: "attire",
        label: "Change into business attire",
        defaultOn: true,
      },
    ],
    cover: "/covers/tool-headshot.webp",
    systemPrompt: (p) =>
      `Turn the uploaded photo into a professional business headshot. Style: ${p.style ?? "Corporate"}. Background: ${p.background ?? "Grey gradient"}.${p.attire === "true" ? " Dress the person in appropriate business attire." : " Keep the current clothing."} Keep the face fully recognizable. Soft professional studio lighting, crisp focus, LinkedIn-quality result.`,
  },
  {
    slug: "portrait-background",
    name: "Background Swap",
    tagline: "A new backdrop behind the portrait",
    category: "people",
    price: 2,
    output: { kind: "image", frames: 1 },
    size: "1024x1536",
    inputs: [
      {
        id: "photo",
        label: "Photo",
        required: true,
        accept: "image/*",
        note: "Any portrait or full-body shot",
      },
    ],
    controls: [
      {
        kind: "select",
        id: "preset",
        label: "Preset backdrop",
        options: ["Studio light", "Evening city", "Nature", "Office", "Describe your own"],
      },
      {
        kind: "text",
        id: "custom",
        label: "Backdrop description",
        placeholder: "a summer terrace at sunset",
        optional: true,
      },
    ],
    cover: "/covers/tool-portrait-background.webp",
    systemPrompt: (p) => {
      const backdrop =
        p.preset === "Describe your own" && p.custom
          ? p.custom
          : (p.preset ?? "Studio light");
      return `Replace the background behind the person in the uploaded photo with: ${backdrop}. Keep the person completely unchanged — identical face, hair, pose and clothing. Match the lighting of the new backdrop naturally, with believable edges.`;
    },
  },
  {
    slug: "retouch",
    name: "Retouch & Polish",
    tagline: "Clean skin and even light",
    category: "people",
    price: 2,
    popular: true,
    output: { kind: "image", frames: 1 },
    size: "1024x1536",
    inputs: [
      {
        id: "photo",
        label: "Photo",
        required: true,
        accept: "image/*",
        note: "A portrait you want cleaned up",
      },
    ],
    controls: [
      {
        kind: "select",
        id: "strength",
        label: "Strength",
        options: ["Natural", "Polished", "Editorial"],
      },
      { kind: "switch", id: "lighting", label: "Fix the lighting" },
    ],
    cover: "/covers/tool-retouch.webp",
    systemPrompt: (p) =>
      `Retouch the uploaded portrait at "${p.strength ?? "Natural"}" strength: clean up temporary skin blemishes, reduce shine and even the skin tone while keeping real texture and every identifying feature.${p.lighting === "true" ? " Also rebalance the lighting: fill harsh shadows and recover blown highlights for an even, flattering exposure." : ""} The person must stay completely recognizable. Do not change face shape, features or body.`,
  },
  {
    slug: "restore-photo",
    name: "Photo Restoration",
    tagline: "Bring an old shot back to life",
    category: "people",
    price: 3,
    output: { kind: "image", frames: 1 },
    size: "1024x1024",
    inputs: [
      {
        id: "photo",
        label: "Old photo",
        required: true,
        accept: "image/*",
        note: "A scan or photo of the damaged print",
      },
    ],
    controls: [
      { kind: "switch", id: "colorize", label: "Colorize" },
      { kind: "switch", id: "sharpen", label: "Add sharpness and detail" },
    ],
    cover: "/covers/tool-restore-photo.webp",
    systemPrompt: (p) =>
      `Restore the uploaded old photograph: repair scratches, tears, stains and fading; reconstruct damaged areas faithfully.${p.colorize === "true" ? " Colorize it with realistic period-appropriate colours." : " Keep the original tones."}${p.sharpen === "true" ? " Recover fine detail and sharpness where the print has softened." : ""} Preserve the people and scene exactly as they were — this is a restoration, not a reinterpretation.`,
  },
  {
    slug: "hairstyle",
    name: "New Hairstyle",
    tagline: "Try on a cut and color",
    category: "people",
    price: 2,
    output: { kind: "image", frames: 1 },
    size: "1024x1536",
    inputs: [
      {
        id: "photo",
        label: "Your photo",
        required: true,
        accept: "image/*",
        note: "A portrait where the hair is clearly visible",
      },
    ],
    controls: [
      {
        kind: "text",
        id: "hairstyle",
        label: "Hairstyle",
        placeholder: "a short bob with straight bangs",
      },
      {
        kind: "select",
        id: "color",
        label: "Color",
        options: ["Keep mine", "Blond", "Brunette", "Red", "Silver", "Pastel color"],
      },
    ],
    cover: "/covers/tool-hairstyle.webp",
    systemPrompt: (p) =>
      `Change the person's hairstyle in the uploaded photo to: ${p.hairstyle || "a fresh modern cut"}.${p.color && p.color !== "Keep mine" ? ` Hair color: ${p.color}.` : " Keep the natural hair color."} Keep the face, skin and background exactly the same. The new hair must look natural with realistic strands and correct lighting.`,
  },
  {
    slug: "fitting-room",
    name: "Fitting Room",
    tagline: "Change the outfit in a photo",
    category: "people",
    price: 2,
    popular: true,
    output: { kind: "image", frames: 1 },
    size: "1024x1536",
    inputs: [
      {
        id: "photo",
        label: "Photo of person",
        required: true,
        accept: "image/*",
        note: "Half or full body works best",
      },
      {
        id: "garment",
        label: "Photo of garment",
        required: false,
        accept: "image/*",
        note: "Optional — add one and we will put on exactly that piece",
      },
    ],
    controls: [
      {
        kind: "text",
        id: "outfit",
        label: "What to wear",
        placeholder: "a beige coat and a white sweater",
      },
      {
        kind: "select",
        id: "fit",
        label: "Fit",
        options: ["Regular", "Oversized", "Fitted"],
      },
    ],
    cover: "/covers/tool-fitting-room.webp",
    systemPrompt: (p) =>
      `Dress the person from the first uploaded photo in ${p.outfit ? `: ${p.outfit}` : "the garment from the second uploaded photo"}. Fit: ${p.fit ?? "Regular"}. If a garment photo is provided, reproduce exactly that piece — same fabric, colour and details. Keep the person's face, pose and the background unchanged. The clothing must drape naturally with believable folds and lighting.`,
  },
  {
    slug: "avatar-style",
    name: "Styled Avatar",
    tagline: "Anime, 3D, comic book",
    category: "people",
    price: 2,
    output: { kind: "image", frames: 1 },
    size: "1024x1024",
    inputs: [
      {
        id: "photo",
        label: "Your photo",
        required: true,
        accept: "image/*",
        note: "A clear portrait for the avatar",
      },
    ],
    controls: [
      {
        kind: "select",
        id: "universe",
        label: "Universe",
        options: [
          "Anime",
          "3D cartoon",
          "Comic book",
          "Watercolor",
          "Cyberpunk",
          "Low-poly 3D",
        ],
      },
      { kind: "switch", id: "keepBackground", label: "Keep the background" },
    ],
    cover: "/covers/tool-avatar-style.webp",
    systemPrompt: (p) =>
      `Redraw the uploaded portrait as a stylized avatar in the "${p.universe ?? "Anime"}" universe. The person must stay clearly recognizable — same face structure, hair and expression, translated into the style.${p.keepBackground === "true" ? " Keep the original background, stylized to match." : " Replace the background with a clean complementary backdrop in the same style."} High detail, avatar-ready composition.`,
  },
  // ── Products & Business ──────────────────────────────────────────────
  {
    slug: "product-shot",
    name: "Product Shot",
    tagline: "Studio photography for listings",
    category: "products",
    price: 3,
    popular: true,
    output: { kind: "image", frames: 1 },
    size: "1024x1024",
    inputs: [
      {
        id: "photo",
        label: "Product photo",
        required: true,
        accept: "image/*",
        note: "Any phone shot of the product works",
      },
    ],
    controls: [
      {
        kind: "select",
        id: "scene",
        label: "Scene",
        options: ["White background", "Marble", "Wood", "Color gradient", "In a room"],
      },
      {
        kind: "select",
        id: "angle",
        label: "Angle",
        options: ["Straight on", "Three-quarter", "Top down"],
      },
      { kind: "switch", id: "shadow", label: "Soft shadow", defaultOn: true },
    ],
    cover: "/covers/tool-product-shot.webp",
    systemPrompt: (p) =>
      `Re-shoot the uploaded product as a professional e-commerce studio photo. Scene: ${p.scene ?? "White background"}. Camera angle: ${p.angle ?? "Straight on"}.${p.shadow === "true" ? " Add a soft realistic contact shadow." : " No visible shadow."} Keep the product identical — same shape, colours, materials, labels and text. Crisp commercial lighting, listing-ready.`,
  },
  {
    slug: "cutout",
    name: "Cut Out Background",
    tagline: "Transparent PNG",
    category: "products",
    price: 2,
    output: { kind: "image", frames: 1 },
    size: "1024x1024",
    inputs: [
      {
        id: "photo",
        label: "Photo",
        required: true,
        accept: "image/*",
        note: "The subject should be clearly visible",
      },
    ],
    controls: [
      {
        kind: "text",
        id: "keep",
        label: "What to keep",
        placeholder: "the sneaker",
      },
    ],
    cover: "/covers/tool-cutout.webp",
    systemPrompt: (p) =>
      `Cut out ${p.keep || "the main subject"} from the uploaded photo and return it on a fully transparent background. Clean precise edges including fine details like hair or fabric texture. Keep the subject pixel-identical. Output must be a transparent PNG.`,
  },
  {
    slug: "ad-banner",
    name: "Ad Banner",
    tagline: "An image with text on it",
    category: "products",
    price: 3,
    output: { kind: "image", frames: 1 },
    inputs: [
      {
        id: "photo",
        label: "Product/background photo",
        required: false,
        accept: "image/*",
        note: "Optional — without it we draw the banner from scratch",
      },
    ],
    controls: [
      {
        kind: "text",
        id: "headline",
        label: "Headline",
        placeholder: "30% off until Sunday",
      },
      {
        kind: "text",
        id: "subheading",
        label: "Subheading",
        placeholder: "Optional",
        optional: true,
      },
      {
        kind: "select",
        id: "format",
        label: "Format",
        options: ["Square 1:1", "Landscape 3:2", "Portrait 2:3"],
      },
      {
        kind: "select",
        id: "style",
        label: "Style",
        options: ["Bold and punchy", "Minimal", "Premium", "Playful"],
      },
    ],
    cover: "/covers/tool-ad-banner.webp",
    systemPrompt: (p) =>
      `Design an advertising banner${p.photo ? " built around the uploaded photo" : ""}. Main headline text, rendered large and perfectly legible: "${p.headline ?? ""}".${p.subheading ? ` Secondary line: "${p.subheading}".` : ""} Visual style: ${p.style ?? "Bold and punchy"}. Professional advertising layout with strong hierarchy, brand-quality typography, exact spelling of all text.`,
  },
  {
    slug: "logo",
    name: "Logo & App Icon",
    tagline: "A mark for your brand",
    category: "products",
    price: 2,
    output: { kind: "image", frames: 1 },
    size: "1024x1024",
    inputs: [],
    controls: [
      { kind: "text", id: "name", label: "Name", placeholder: "Northwind" },
      {
        kind: "textarea",
        id: "about",
        label: "What the brand does",
        placeholder: "a coffee delivery service",
      },
      {
        kind: "select",
        id: "style",
        label: "Style",
        options: ["Geometric", "Lettermark", "Mascot", "Gradient icon", "Vintage"],
      },
      {
        kind: "select",
        id: "palette",
        label: "Palette",
        options: ["Monochrome", "Warm", "Cool", "Vivid"],
      },
    ],
    cover: "/covers/tool-logo.webp",
    systemPrompt: (p) =>
      `Design a logo for "${p.name ?? "the brand"}" — ${p.about ?? "a modern company"}. Style: ${p.style ?? "Geometric"}. Colour palette: ${p.palette ?? "Monochrome"}. A single clean mark centred on a plain background, working at small sizes, suitable as an app icon. Vector-crisp edges, no photo elements, no extra text beyond the name if the style calls for it.`,
  },
  {
    slug: "product-copy",
    name: "Product Copy",
    tagline: "Title, description, tags",
    category: "products",
    price: 1,
    output: { kind: "text" },
    inputs: [
      {
        id: "photo",
        label: "Product photo",
        required: true,
        accept: "image/*",
        note: "We write from what we see",
      },
    ],
    controls: [
      {
        kind: "select",
        id: "channel",
        label: "Channel",
        options: ["Universal", "Marketplace", "Own store", "Social media"],
      },
      {
        kind: "select",
        id: "tone",
        label: "Tone",
        options: ["Confident", "Warm", "Premium", "Simple and clear"],
      },
    ],
    cover: "/covers/tool-product-copy.webp",
    systemPrompt: (p) =>
      `Look at the uploaded product photo and write selling copy for the "${p.channel ?? "Universal"}" channel in a ${p.tone ?? "Confident"} tone. Return exactly three sections, each with a heading: 1) Title — one line, under 70 characters; 2) Description — 2-3 short paragraphs, concrete benefits, no fluff; 3) Tags — 8-12 comma-separated search tags. Plain text, no markdown symbols.`,
  },
  // ── Spaces ───────────────────────────────────────────────────────────
  {
    slug: "interior-redesign",
    name: "Interior Redesign",
    tagline: "The same room in a new style",
    category: "spaces",
    price: 3,
    popular: true,
    output: { kind: "image", frames: 1 },
    size: "1536x1024",
    inputs: [
      {
        id: "photo",
        label: "Photo of the room",
        required: true,
        accept: "image/*",
        note: "Shoot from a corner to catch more of the room",
      },
    ],
    controls: [
      {
        kind: "select",
        id: "style",
        label: "Style",
        options: ["Scandinavian", "Loft", "Japandi", "Classic", "Minimal", "Boho"],
      },
      {
        kind: "select",
        id: "room",
        label: "Room",
        options: ["Living room", "Bedroom", "Kitchen", "Bathroom", "Home office"],
      },
      { kind: "switch", id: "keepLayout", label: "Keep the layout", defaultOn: true },
    ],
    cover: "/covers/tool-interior-redesign.webp",
    systemPrompt: (p) =>
      `Redesign the ${(p.room ?? "Living room").toLowerCase()} in the uploaded photo in the ${p.style ?? "Scandinavian"} style: new finishes, furniture and decor true to the style.${p.keepLayout === "true" ? " Keep the room's architecture and layout exactly — same walls, windows, doors and camera angle." : " You may rearrange furniture, but keep the same room and viewpoint."} Photorealistic interior-magazine quality with natural light.`,
  },
  {
    slug: "virtual-staging",
    name: "Virtual Staging",
    tagline: "Furnish an empty room",
    category: "spaces",
    price: 3,
    output: { kind: "image", frames: 1 },
    size: "1536x1024",
    inputs: [
      {
        id: "photo",
        label: "Photo of the empty room",
        required: true,
        accept: "image/*",
        note: "Empty or nearly empty rooms work best",
      },
    ],
    controls: [
      {
        kind: "select",
        id: "style",
        label: "Style",
        options: ["Modern", "Scandinavian", "Classic", "Family comfort"],
      },
      {
        kind: "select",
        id: "room",
        label: "Room",
        options: ["Living room", "Bedroom", "Kitchen and dining", "Kids room"],
      },
    ],
    cover: "/covers/tool-virtual-staging.webp",
    systemPrompt: (p) =>
      `Furnish the empty room in the uploaded photo as a ${(p.room ?? "Living room").toLowerCase()} in the ${p.style ?? "Modern"} style: tasteful furniture, lighting, textiles and decor arranged naturally. Keep the room's architecture, windows, flooring and camera angle exactly as shot. Photorealistic real-estate staging quality.`,
  },
  {
    slug: "exterior",
    name: "Facade & Yard",
    tagline: "The house from outside",
    category: "spaces",
    price: 3,
    output: { kind: "image", frames: 1 },
    size: "1536x1024",
    inputs: [
      {
        id: "photo",
        label: "Photo of the house",
        required: true,
        accept: "image/*",
        note: "The whole facade in the frame",
      },
    ],
    controls: [
      {
        kind: "select",
        id: "style",
        label: "Style",
        options: ["Modern", "Barnhouse", "Classic", "Chalet"],
      },
      {
        kind: "select",
        id: "season",
        label: "Season",
        options: ["Summer", "Autumn", "Winter", "Evening with lights"],
      },
      { kind: "switch", id: "landscape", label: "Landscape the yard" },
    ],
    cover: "/covers/tool-exterior.webp",
    systemPrompt: (p) =>
      `Renovate the house facade in the uploaded photo in the ${p.style ?? "Modern"} style. Season and mood: ${p.season ?? "Summer"}.${p.landscape === "true" ? " Landscape the yard: paths, planting and outdoor lighting that suit the style." : " Keep the yard as it is."} Keep the building's structure, proportions and viewpoint; change materials, colours and details. Photorealistic architectural visualization.`,
  },
  // ── Frame Editing ────────────────────────────────────────────────────
  {
    slug: "remove-object",
    name: "Remove Object",
    tagline: "Brush over what bothers you",
    category: "editing",
    price: 2,
    output: { kind: "image", frames: 1 },
    inputs: [
      {
        id: "photo",
        label: "Photo",
        required: true,
        accept: "image/*",
        note: "Then paint over what should disappear",
      },
    ],
    controls: [{ kind: "brushMask", id: "mask", label: "Paint over what to remove" }],
    cover: "/covers/tool-remove-object.webp",
    systemPrompt: () =>
      `Remove everything inside the masked area of the uploaded photo and reconstruct the background behind it seamlessly — matching texture, lighting and perspective. Everything outside the mask must stay pixel-identical.`,
  },
  {
    slug: "replace-object",
    name: "Replace Object",
    tagline: "Brush plus a description",
    category: "editing",
    price: 2,
    output: { kind: "image", frames: 1 },
    inputs: [
      {
        id: "photo",
        label: "Photo",
        required: true,
        accept: "image/*",
        note: "Then paint over the area to replace",
      },
    ],
    controls: [
      { kind: "brushMask", id: "mask", label: "Paint over what to replace" },
      {
        kind: "text",
        id: "draw",
        label: "What to draw",
        placeholder: "a bouquet of wildflowers",
      },
    ],
    cover: "/covers/tool-replace-object.webp",
    systemPrompt: (p) =>
      `Inside the masked area of the uploaded photo, draw: ${p.draw || "a fitting replacement"}. Blend it naturally with the scene — correct scale, perspective, lighting and shadows. Everything outside the mask must stay pixel-identical.`,
  },
  {
    slug: "expand-frame",
    name: "Expand Frame",
    tagline: "Build out beyond the edges",
    category: "editing",
    price: 2,
    output: { kind: "image", frames: 1 },
    inputs: [
      {
        id: "photo",
        label: "Photo",
        required: true,
        accept: "image/*",
        note: "We extend the scene beyond its borders",
      },
    ],
    controls: [
      {
        kind: "select",
        id: "format",
        label: "New format",
        options: ["Square 1:1", "Landscape 3:2", "Portrait 2:3"],
      },
      {
        kind: "text",
        id: "hint",
        label: "Hint",
        placeholder: "What belongs at the edges, optional",
        optional: true,
      },
    ],
    cover: "/covers/tool-expand-frame.webp",
    systemPrompt: (p) =>
      `Expand the uploaded photo beyond its original edges to fill a ${p.format ?? "Square 1:1"} frame. Continue the scene naturally in every direction — consistent lighting, perspective, textures and subject matter.${p.hint ? ` At the edges add: ${p.hint}.` : ""} The original image content must stay unchanged in the centre.`,
  },
  {
    slug: "free-generate",
    name: "Free Generation",
    tagline: "An image from your description",
    category: "editing",
    price: 2,
    popular: true,
    output: { kind: "image", frames: 1 },
    inputs: [],
    controls: [
      {
        kind: "textarea",
        id: "prompt",
        label: "What to draw",
        placeholder: "Describe the shot in as much detail as you can",
        maxLength: 100,
        examples: [
          "A red fox asleep on a mossy stump, morning fog",
          "A ceramic cup of coffee on a windowsill in the rain",
        ],
      },
      {
        kind: "select",
        id: "format",
        label: "Format",
        options: ["Square 1:1", "Landscape 3:2", "Portrait 2:3"],
      },
      {
        kind: "select",
        id: "style",
        label: "Style",
        options: ["Photograph", "Film still", "Illustration", "3D render", "Poster"],
      },
    ],
    cover: "/covers/tool-free-generate.webp",
    systemPrompt: (p) =>
      `${p.prompt ?? ""}. Rendered as a ${(p.style ?? "Photograph").toLowerCase()}: ${
        {
          Photograph: "photorealistic, natural light, believable detail",
          "Film still": "cinematic film still, anamorphic framing, movie colour grade",
          Illustration: "hand-crafted illustration with confident linework and rich colour",
          "3D render": "polished 3D render, soft global illumination, high-end CGI",
          Poster: "bold poster art with striking composition and graphic colour",
        }[p.style ?? "Photograph"] ?? "photorealistic"
      }. High quality, coherent composition.`,
  },
  // ── Text & Voice ─────────────────────────────────────────────────────
  {
    slug: "photo-description",
    name: "Photo Description",
    tagline: "Alt text and SEO tags",
    category: "text-voice",
    price: 1,
    output: { kind: "text" },
    inputs: [
      {
        id: "photo",
        label: "Image",
        required: true,
        accept: "image/*",
        note: "Any image you need described",
      },
    ],
    controls: [
      {
        kind: "select",
        id: "language",
        label: "Language",
        options: ["English", "Spanish", "German", "French"],
      },
      {
        kind: "select",
        id: "length",
        label: "Length",
        options: ["Short", "Medium", "Detailed"],
      },
    ],
    cover: "/covers/tool-photo-description.webp",
    systemPrompt: (p) =>
      `Describe the uploaded image in ${p.language ?? "English"}. Return exactly three sections, each with a heading: 1) Alt text — one ${(p.length ?? "Medium").toLowerCase()} sentence for screen readers; 2) Description — ${p.length === "Short" ? "one paragraph" : p.length === "Detailed" ? "3-4 paragraphs" : "1-2 paragraphs"} covering subject, setting, colours and mood; 3) SEO tags — 10-15 comma-separated keywords. Plain text, no markdown symbols.`,
  },
  {
    slug: "voiceover",
    name: "Voiceover",
    tagline: "A living voice from your text",
    category: "text-voice",
    price: 1,
    output: { kind: "audio" },
    inputs: [],
    controls: [
      {
        kind: "textarea",
        id: "text",
        label: "Text",
        placeholder: "Paste the text to read out loud",
      },
      {
        kind: "select",
        id: "voice",
        label: "Voice",
        options: ["Coral warm", "Alloy neutral", "Verse expressive", "Sage calm", "Ballad soft"],
      },
      {
        kind: "select",
        id: "delivery",
        label: "Delivery",
        options: ["Even", "Cheerful", "Calm", "Dramatic", "Like an ad"],
      },
    ],
    cover: "/covers/tool-voiceover.webp",
    systemPrompt: (p) =>
      `Read the text aloud. Delivery: ${
        {
          Even: "even, steady pacing with a neutral professional tone",
          Cheerful: "bright, upbeat and smiling",
          Calm: "slow, soothing and reassuring",
          Dramatic: "expressive and theatrical with weighted pauses",
          "Like an ad": "energetic advertising read with confident emphasis",
        }[p.delivery ?? "Even"] ?? "even and natural"
      }.`,
  },
  {
    slug: "transcribe",
    name: "Transcription",
    tagline: "Audio into text",
    category: "text-voice",
    price: 1,
    output: { kind: "text" },
    inputs: [
      {
        id: "audio",
        label: "Audio file",
        required: true,
        accept: "audio/*,video/mp4",
        note: "mp3, wav, m4a, ogg or webm",
      },
    ],
    controls: [
      {
        kind: "text",
        id: "context",
        label: "Context",
        placeholder: "Names, terms and titles, optional",
        optional: true,
      },
    ],
    cover: "/covers/tool-transcribe.webp",
    systemPrompt: (p) => p.context ?? "",
  },
];

export const getTool = (slug: string): ToolConfig | undefined =>
  TOOLS.find((tool) => tool.slug === slug);

export const getToolsByCategory = (category: CategoryId): ToolConfig[] =>
  TOOLS.filter((tool) => tool.category === category);

export const OPENAI_VOICES: Record<string, string> = {
  "Coral warm": "coral",
  "Alloy neutral": "alloy",
  "Verse expressive": "verse",
  "Sage calm": "sage",
  "Ballad soft": "ballad",
};
