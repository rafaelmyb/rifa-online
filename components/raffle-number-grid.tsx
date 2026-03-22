"use client";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

type NumberItem = { value: number; status: "AVAILABLE" | "HELD" | "SOLD" };

type RaffleNumberGridProps = {
  numbers: NumberItem[];
  selected: Set<number>;
  onToggle: (value: number) => void;
};

export const RaffleNumberGrid = ({
  numbers,
  selected,
  onToggle,
}: RaffleNumberGridProps) => {
  return (
    <ScrollArea className="h-[min(28rem,52vh)] w-full rounded-md border border-border">
      <div
        className="grid grid-cols-4 gap-1.5 p-3 sm:grid-cols-6 sm:gap-2 md:grid-cols-8 md:gap-2.5 lg:grid-cols-10 lg:gap-3 xl:grid-cols-12"
        role="group"
        aria-label="Números da rifa"
      >
        {numbers.map(({ value, status }) => {
          const taken = status !== "AVAILABLE";
          const isSelected = selected.has(value);
          return (
            <button
              key={value}
              type="button"
              disabled={taken}
              onClick={() => onToggle(value)}
              className={cn(
                // Preflight costuma reduzir opacity em disabled — isso apagava o fundo dos tomados.
                "flex min-h-9 min-w-0 items-center justify-center rounded-md border text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-100 sm:text-sm",
                taken &&
                  "border-zinc-600 bg-zinc-500 text-zinc-950 dark:border-zinc-500 dark:bg-zinc-700 dark:text-zinc-50",
                !taken &&
                  !isSelected &&
                  "border-border bg-muted/40 text-foreground hover:bg-muted hover:text-foreground",
                !taken &&
                  isSelected &&
                  "border-green-700 bg-green-600 text-white hover:bg-green-600 dark:border-green-600 dark:bg-green-600 dark:hover:bg-green-600",
              )}
            >
              {value}
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
};
