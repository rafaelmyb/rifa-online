import { auth } from "@/auth";
import { exportReservationsExcel } from "@/lib/actions/reservations-admin";

type RouteContext = { params: Promise<{ raffleId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { raffleId } = await context.params;

  try {
    const buf = await exportReservationsExcel(raffleId);
    return new Response(buf, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="pedidos-${raffleId}.xlsx"`,
      },
    });
  } catch {
    return new Response("Forbidden", { status: 403 });
  }
}
