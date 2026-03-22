"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type CopyLinkButtonProps = { url: string };

export const CopyLinkButton = ({ url }: CopyLinkButtonProps) => {
  const [done, setDone] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setDone(true);
      toast.success("Link copiado");
      setTimeout(() => setDone(false), 2000);
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  return (
    <Button type="button" variant="outline" size="sm" onClick={() => void copy()}>
      {done ? (
        <Check className="mr-1 size-3.5" />
      ) : (
        <Copy className="mr-1 size-3.5" />
      )}
      Copiar link
    </Button>
  );
};
