export type Pack = {
  id: "starter" | "creator" | "studio" | "agency";
  name: string;
  priceCents: number;
  credits: number;
  bonus: number;
  perCredit: string;
  note: string;
  bestValue?: boolean;
  bullets: string[];
};

export const PACKS: Pack[] = [
  {
    id: "starter",
    name: "Starter",
    priceCents: 900,
    credits: 100,
    bonus: 0,
    perCredit: "$0.090/cr",
    note: "About 50 studio frames",
    bullets: [
      "50 single images or 12 studio batches",
      "All 23 tools, no feature gates",
      "Credits never expire, failed runs refunded",
    ],
  },
  {
    id: "creator",
    name: "Creator",
    priceCents: 1900,
    credits: 350,
    bonus: 50,
    perCredit: "$0.054/cr",
    note: "Most picked — 50 credits on the house",
    bestValue: true,
    bullets: [
      "200 single images or 50 studio batches",
      "All 23 tools, no feature gates",
      "Credits never expire, failed runs refunded",
    ],
  },
  {
    id: "studio",
    name: "Studio",
    priceCents: 4900,
    credits: 1250,
    bonus: 250,
    perCredit: "$0.039/cr",
    note: "For steady weekly output",
    bullets: [
      "750 single images or 187 studio batches",
      "All 23 tools, no feature gates",
      "Credits never expire, failed runs refunded",
    ],
  },
  {
    id: "agency",
    name: "Agency",
    priceCents: 9900,
    credits: 3250,
    bonus: 750,
    perCredit: "$0.030/cr",
    note: "Volume for client work",
    bullets: [
      "2,000 single images or 500 studio batches",
      "All 23 tools, no feature gates",
      "Credits never expire, failed runs refunded",
    ],
  },
];

export const getPack = (id: string): Pack | undefined =>
  PACKS.find((pack) => pack.id === id);

export const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export const WELCOME_CREDITS = 20;
