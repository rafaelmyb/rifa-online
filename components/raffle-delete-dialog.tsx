"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteRaffle } from "@/lib/actions/raffle-crud";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";

type RaffleDeleteDialogProps = {
  raffleId: string;
  title: string;
};

export const RaffleDeleteDialog = ({
  raffleId,
  title,
}: RaffleDeleteDialogProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteRaffle(raffleId);
      toast.success("Rifa excluída");
      setOpen(false);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao excluir a rifa");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        type="button"
        className={cn(
          buttonVariants({ variant: "link", size: "sm" }),
          "text-destructive hover:text-destructive h-auto p-0",
        )}
      >
        Excluir
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir rifa?</AlertDialogTitle>
          <AlertDialogDescription>
            A rifa &quot;{title}&quot; será removida para sempre. Todos os
            números e pedidos vinculados também serão apagados. Esta ação não
            pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={loading}
            onClick={() => void handleDelete()}
          >
            {loading ? "Excluindo…" : "Excluir definitivamente"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
