import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEffectiveUserId } from "@/lib/effective-user-id";
import { calcHours } from "@/lib/pdf/pdf-utils";
import { Badge } from "@/components/ui/Badge";
import { Table, Thead, Tbody, Th, Td, Tr, EmptyRow } from "@/components/ui/Table";

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("nl-BE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function fmtTime(t: string) {
  return t.slice(0, 5);
}

function fmtMonth(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("nl-BE", {
    month: "long",
    year: "numeric",
  });
}

function offsetMonth(ym: string, delta: number) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const STATUS_LABEL: Record<string, string> = {
  pending_apotheek: "In behandeling",
  approved: "Goedgekeurd",
  denied: "Geweigerd",
  pending_assistant: "Wacht op assistent",
};

const STATUS_VARIANT: Record<
  string,
  "success" | "warning" | "danger" | "neutral" | "info"
> = {
  approved: "success",
  pending_apotheek: "warning",
  pending_assistant: "neutral",
  denied: "danger",
};

const SHIFT_SELECT = `
  id, date, start_time, end_time, break_minutes, status,
  assistant:users(first_name, last_name),
  location:locations(name)
`;

export default async function ApotheekPrestatiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const effectiveId = await getEffectiveUserId(user.id);
  const params = await searchParams;
  const month = params.month ?? new Date().toISOString().slice(0, 7);

  const admin = await createClient();

  const { data: rawLocations } = await admin
    .from("locations")
    .select("id")
    .eq("pharmacy_id", effectiveId)
    .is("deleted_at", null);

  const locationIds = (rawLocations ?? []).map((l) => l.id);

  const [y, m] = month.split("-").map(Number);
  const monthStart = `${month}-01`;
  const monthEnd = new Date(Date.UTC(y, m, 0)).toISOString().split("T")[0];

  const { data: rawShifts } =
    locationIds.length === 0
      ? { data: [] }
      : await admin
          .from("shifts")
          .select(SHIFT_SELECT)
          .in("location_id", locationIds)
          .in("status", ["approved", "pending_apotheek"])
          .is("deleted_at", null)
          .gte("date", monthStart)
          .lte("date", monthEnd)
          .order("date", { ascending: true });

  type ShiftRow = {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    breakMinutes: number;
    status: string;
    assistantName: string;
    locationName: string;
  };

  const shifts: ShiftRow[] = (rawShifts ?? []).map((s) => {
    const asst = s.assistant as unknown as {
      first_name: string | null;
      last_name: string | null;
    } | null;
    const loc = s.location as unknown as { name: string } | null;
    return {
      id: s.id,
      date: s.date,
      startTime: s.start_time,
      endTime: s.end_time,
      breakMinutes: s.break_minutes,
      status: s.status,
      assistantName: asst
        ? [asst.first_name, asst.last_name].filter(Boolean).join(" ")
        : "—",
      locationName: loc?.name ?? "—",
    };
  });

  const prevM = offsetMonth(month, -1);
  const nextM = offsetMonth(month, 1);
  const currentM = new Date().toISOString().slice(0, 7);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-8 py-6 border-b border-border shrink-0">
        <p className="text-xs text-text-muted mb-1">Prestaties</p>
        <h1 className="text-2xl font-bold text-text">Mijn prestaties</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center gap-4 px-6 py-4 bg-slate-50 border-b border-border">
          <Link
            href={`/apotheek/prestaties?month=${prevM}`}
            className="text-sm text-primary hover:underline"
          >
            ← Vorige
          </Link>
          <span className="text-sm font-semibold text-text capitalize">
            {fmtMonth(month)}
          </span>
          <Link
            href={`/apotheek/prestaties?month=${nextM}`}
            className="text-sm text-primary hover:underline"
          >
            Volgende →
          </Link>
          {month !== currentM && (
            <Link
              href="/apotheek/prestaties"
              className="ml-auto text-xs text-text-muted hover:underline"
            >
              Huidige maand
            </Link>
          )}
        </div>

        <Table>
          <Thead>
            <Tr>
              <Th>Datum</Th>
              <Th>Assistent</Th>
              <Th>Locatie</Th>
              <Th>Uren</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {shifts.length === 0 ? (
              <EmptyRow colSpan={5} message="Geen shifts gevonden voor deze maand." />
            ) : (
              shifts.map((s) => (
                <Tr key={s.id}>
                  <Td>
                    <p className="font-medium">{fmtDate(s.date)}</p>
                    <p className="text-xs text-text-muted">
                      {fmtTime(s.startTime)}–{fmtTime(s.endTime)}
                      {s.breakMinutes > 0 && ` (${s.breakMinutes} min pauze)`}
                    </p>
                  </Td>
                  <Td>{s.assistantName}</Td>
                  <Td>{s.locationName}</Td>
                  <Td>
                    {calcHours(s.startTime, s.endTime, s.breakMinutes)
                      .toFixed(2)
                      .replace(".", ",")}
                    {" u"}
                  </Td>
                  <Td>
                    <Badge variant={STATUS_VARIANT[s.status] ?? "neutral"}>
                      {STATUS_LABEL[s.status] ?? s.status}
                    </Badge>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </div>
    </div>
  );
}
