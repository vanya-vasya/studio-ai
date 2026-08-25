"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";

export const Switch = ({
  checked,
  onCheckedChange,
  ariaLabel,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  ariaLabel: string;
}) => (
  <SwitchPrimitive.Root
    checked={checked}
    onCheckedChange={onCheckedChange}
    aria-label={ariaLabel}
    className="relative h-6 w-11 shrink-0 rounded-full border border-white/10 bg-white/10 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-purple-400/60 data-[state=checked]:border-transparent data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-fuchsia-500 data-[state=checked]:to-indigo-500"
  >
    <SwitchPrimitive.Thumb className="block size-5 translate-x-0.5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-[22px]" />
  </SwitchPrimitive.Root>
);
