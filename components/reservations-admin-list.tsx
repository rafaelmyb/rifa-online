"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import {
  deletePendingReservation,
  markReservationPaid,
} from "@/lib/actions/reservations-admin";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Row = {
  id: string;
  buyerName: string;
  buyerPhone: string;
  totalCents: number;
  status: "PENDING_PAYMENT" | "PAID";
  createdAt: string;
  numbers: string;
};

type ReservationsAdminListProps = { rows: Row[]; exportHref: string };

export const ReservationsAdminList = ({
  rows,
  exportHref,
}: ReservationsAdminListProps) => {
  const router = useRouter();
  const [pending, start] = useTransition();

  const paid = (id: string) => {
    start(async () => {
      try {
        await markReservationPaid(id);
        toast.success("Marcado como pago");
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro");
      }
    });
  };

  const remove = (id: string) => {
    start(async () => {
      try {
        await deletePendingReservation(id);
        toast.success("Pedido excluído; números reliberados");
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Números</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground">
                  Nenhum pedido ainda.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.buyerName}</TableCell>
                  <TableCell>{r.buyerPhone}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs">
                    {r.numbers}
                  </TableCell>
                  <TableCell>
                    {(r.totalCents / 100).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </TableCell>
                  <TableCell>
                    {r.status === "PAID" ? "Pago" : "Pendente"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs">
                    {new Date(r.createdAt).toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-1">
                      {r.status === "PENDING_PAYMENT" ? (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            disabled={pending}
                            onClick={() => paid(r.id)}
                          >
                            Pago
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={pending}
                            onClick={() => remove(r.id)}
                          >
                            Excluir
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <a
        href={exportHref}
        className={cn(buttonVariants({ variant: "secondary" }))}
      >
        Exportar Excel
      </a>
    </div>
  );
};
