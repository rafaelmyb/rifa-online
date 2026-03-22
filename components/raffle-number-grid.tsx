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
                "flex min-h-9 min-w-0 items-center justify-center rounded-md border text-xs font-medium transition-colors sm:text-sm",
                taken &&
                  "cursor-not-allowed border-muted bg-muted/50 text-muted-foreground",
                !taken &&
                  !isSelected &&
                  "border-border bg-card hover:bg-accent hover:text-accent-foreground",
                !taken &&
                  isSelected &&
                  "border-primary bg-primary text-primary-foreground",
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
