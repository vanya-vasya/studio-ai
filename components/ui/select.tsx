"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

export const Select = ({
  value,
  onValueChange,
  options,
  ariaLabel,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  ariaLabel: string;
}) => (
  <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
    <SelectPrimitive.Trigger
      aria-label={ariaLabel}
      className="flex w-full items-center justify-between rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-purple-500/60 data-[state=open]:border-purple-500/60"
    >
      <SelectPrimitive.Value />
      <SelectPrimitive.Icon>
        <ChevronDown className="size-4 text-zinc-500" aria-hidden />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        position="popper"
        sideOffset={6}
        className="z-50 w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-black/10 bg-white shadow-lg"
      >
        <SelectPrimitive.Viewport className="p-1">
          {options.map((option) => (
            <SelectPrimitive.Item
              key={option}
              value={option}
              className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm text-zinc-700 outline-none data-[highlighted]:bg-black/5 data-[state=checked]:text-purple-600"
            >
              <SelectPrimitive.ItemText>{option}</SelectPrimitive.ItemText>
              <SelectPrimitive.ItemIndicator>
                <Check className="size-3.5" aria-hidden />
              </SelectPrimitive.ItemIndicator>
            </SelectPrimitive.Item>
          ))}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  </SelectPrimitive.Root>
);
