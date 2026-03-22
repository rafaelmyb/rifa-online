"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type PixKeyCopyProps = { pixKey: string };

export const PixKeyCopy = ({ pixKey }: PixKeyCopyProps) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopied(true);
      toast.success("Chave PIX copiada");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  return (
    <div className="flex flex-row items-center gap-2">
      <span className="text-muted-foreground min-w-24 text-base font-medium">
        Chave PIX:
      </span>
      <button
        type="button"
        onClick={() => void copy()}
        title="Clique para copiar a chave PIX"
        className="group focus-visible:ring-ring relative flex w-full cursor-pointer flex-row items-center justify-between gap-1 rounded-md py-2 transition-colors focus-visible:ring-2 focus-visible:outline-none"
        aria-label={`Copiar chave PIX ${pixKey}`}
      >
        <span className="font-mono text-xl font-semibold tracking-wide sm:text-2xl">
          {pixKey}
        </span>
        <span className="text-muted-foreground group-hover:text-foreground inline-flex items-center gap-1 text-xs font-medium opacity-80 group-hover:opacity-100">
          {copied ? (
            <>
              <Check className="size-3.5 text-green-600 dark:text-green-500" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              Copiar
            </>
          )}
        </span>
      </button>
    </div>
  );
};
