"use client";

import Image from "next/image";
import { useState } from "react";
import { LOOK_CATEGORIES, LOOKS, type LookCategory } from "@/lib/looks";

export const LookPicker = ({
  selected,
  onSelect,
  disabled,
}: {
  selected: string | null;
  onSelect: (slug: string) => void;
  disabled: boolean;
}) => {
  const [filter, setFilter] = useState<LookCategory | "all">("all");
  const visible =
    filter === "all" ? LOOKS : LOOKS.filter((look) => look.category === filter);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`chip transition-colors hover:border-white/30 ${
            filter === "all" ? "border-purple-400/60 text-white" : ""
          }`}
        >
          All
        </button>
        {LOOK_CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setFilter(category.id)}
            className={`chip transition-colors hover:border-white/30 ${
              filter === category.id ? "border-purple-400/60 text-white" : ""
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {visible.map((look) => {
          const isSelected = selected === look.slug;
          return (
            <button
              key={look.slug}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(look.slug)}
              aria-pressed={isSelected}
              className={`group relative overflow-hidden rounded-xl border text-left transition-all disabled:opacity-50 ${
                isSelected
                  ? "border-purple-400/80 ring-2 ring-purple-400/40"
                  : "border-white/8 hover:border-white/25"
              }`}
            >
              <div className="relative aspect-[2/3]">
                <Image
                  src={look.previewImage}
                  alt={look.name}
                  fill
                  sizes="(max-width: 768px) 40vw, 15vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-2.5">
                <p className="text-xs font-semibold text-white">{look.name}</p>
                <p className="line-clamp-1 text-[11px] text-zinc-400">
                  {look.tagline}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
