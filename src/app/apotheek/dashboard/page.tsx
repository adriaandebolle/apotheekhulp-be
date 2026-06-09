import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getEffectiveUserId } from "@/lib/effective-user-id";
import { calcHours } from "@/lib/pdf/pdf-utils";
import ApotheekDashboardCharts from "./DashboardCharts";
import type { StatusSlice } from "@/app/admin/dashboard/StatusDonut";

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("nl-BE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatTime(t: string) {
  return t.slice(0, 5);
}

function monthLabel(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("nl-BE", {
    month: "short",
    year: "2-digit",
  });
}

const SHIFT_SELECT = `id, date, start_time, end_time, break_minutes,
  assistant:users(first_name, last_name),
  location:locations(name)`;

export default async function ApotheekDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const effectiveId = await getEffectiveUserId(user.id);
  const admin = createAdminClient();

  const { data: rawLocations } = await admin
    .from("locations")
    .select("id")
    .eq("pharmacy_id", effectiveId)
    .is("deleted_at", null);

  const locationIds = (rawLocations ?? []).map((l) => l.id);

  if (locationIds.length === 0) {
    return (
      <div className="p-8 max-w-5xl">
        <h1 className="text-2xl font-bold text-text mb-6">Dashboard</h1>
        <p className="text-sm text-text-muted">
          Er zijn nog geen locaties gekoppeld aan uw account.
        </p>
      </div>
    );
  }

  const now = new Date();
  const [y, mo] = [now.getFullYear(), now.getMonth() + 1];
  const monthStart = `${y}-${String(mo).padStart(2, "0")}-01`;
  const todayIso = now.toISOString().split("T")[0];

  // Last 12 calendar months oldest-first
  const last12: string[] = [];
  for (let i = 11; i >= 0; i--) {
    let m = mo - i;
    let yr = y;
    while (m <= 0) { m += 12; yr--; }
    last12.push(`${yr}-${String(m).padStart(2, "0")}`);
  }
  const last12Start = `${last12[0]}-01`;

  const [pendingRes, monthRes, upcomingRes, shifts12mRes] = await Promise.all([
    admin
      .from("shifts")
      .select("id", { count: "exact", head: true })
      .in("location_id", locationIds)
      .eq("status", "pending_apotheek")
      .is("deleted_at", null),
    admin
      .from("shifts")
      .select("start_time, end_time, break_minutes")
      .in("location_id", locationIds)
      .eq("status", "approved")
      .is("deleted_at", null)
      .gte("date", monthStart),
    admin
      .from("shifts")
      .select(SHIFT_SELECT)
      .in("location_id", locationIds)
      .eq("status", "approved")
      .is("deleted_at", null)
      .gte("date", todayIso)
      .order("date", { ascending: true })
      .limit(5),
    admin
      .from("shifts")
      .select("date, status, start_time, end_time, break_minutes")
      .in("location_id", locationIds)
      .is("deleted_at", null)
      .gte("date", last12Start),
  ]);

  const pendingCount = pendingRes.count ?? 0;

  let monthHours = 0;
  let monthCount = 0;
  for (const s of monthRes.data ?? []) {
    monthCount++;
    monthHours += calcHours(s.start_time, s.end_time, s.break_minutes);
  }

  type UpcomingShift = {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    assistantName: string;
    locationName: string;
  };

  const upcoming: UpcomingShift[] = (upcomingRes.data ?? []).map((s) => {
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
      assistantName: asst
        ? [asst.first_name, asst.last_name].filter(Boolean).join(" ")
        : "—",
      locationName: loc?.name ?? "—",
    };
  });

  // Chart data
  type MonthPoint = {
    month: string;
    hours: number;
    approved: number;
    pending: number;
    denied: number;
  };

  const all12 = shifts12mRes.data ?? [];
  const monthlyData: MonthPoint[] = last12.map((ym) => {
    const inMonth = all12.filter((s) => s.date.startsWith(ym));
    const approvedInMonth = inMonth.filter((s) => s.status === "approved");
    const hours = approvedInMonth.reduce(
      (sum, s) => sum + calcHours(s.start_time, s.end_time, s.break_minutes),
      0
    );
    return {
      month:    monthLabel(ym),
      hours:    Math.round(hours * 10) / 10,
      approved: approvedInMonth.length,
      pending:  inMonth.filter((s) => s.status === "pending_apotheek" || s.status === "pending_assistant").length,
      denied:   inMonth.filter((s) => s.status === "denied").length,
    };
  });

  const counts = { approved: 0, pending: 0, denied: 0 };
  for (const s of all12) {
    if (s.status === "approved")                                            counts.approved++;
    else if (s.status === "pending_apotheek" || s.status === "pending_assistant") counts.pending++;
    else if (s.status === "denied")                                         counts.denied++;
  }
  const statusData: StatusSlice[] = [
    { status: "Goedgekeurd",    count: counts.approved, color: "#16a34a" },
    { status: "In behandeling", count: counts.pending,  color: "#d97706" },
    { status: "Geweigerd",      count: counts.denied,   color: "#dc2626" },
  ];

  return (
    <div className="p-8 max-w-5xl space-y-8">
      <h1 className="text-2xl font-bold text-text">Dashboard</h1>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
          <p className="text-sm text-text-muted mb-1">In behandeling</p>
          <p className="text-3xl font-bold text-text">{pendingCount}</p>
          {pendingCount > 0 && (
            <p className="text-xs text-warning mt-1">Wacht op Apotheekhulp</p>
          )}
        </div>
        <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
          <p className="text-sm text-text-muted mb-1">Shifts deze maand</p>
          <p className="text-3xl font-bold text-text">{monthCount}</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
          <p className="text-sm text-text-muted mb-1">Uren deze maand</p>
          <p className="text-3xl font-bold text-text">
            {monthHours.toFixed(1)}
          </p>
        </div>
      </div>

      {/* Upcoming shifts */}
      <div className="bg-surface rounded-xl border border-border shadow-sm">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-text">Aankomende shifts</h2>
        </div>
        {upcoming.length === 0 ? (
          <p className="px-5 py-6 text-sm text-text-muted">
            Geen aankomende shifts gepland.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {upcoming.map((s) => (
              <li
                key={s.id}
                className="px-5 py-3 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="text-sm font-medium text-text">
                    {formatDate(s.date)}
                  </p>
                  <p className="text-xs text-text-muted">
                    {s.assistantName} – {s.locationName}
                  </p>
                </div>
                <span className="text-sm text-text-muted whitespace-nowrap">
                  {formatTime(s.startTime)}–{formatTime(s.endTime)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {pendingCount > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <strong>{pendingCount}</strong> shift
          {pendingCount > 1 ? "s worden" : " wordt"} momenteel verwerkt door
          Apotheekhulp.
        </div>
      )}

      {/* Charts */}
      <ApotheekDashboardCharts
        monthlyData={monthlyData}
        statusData={statusData}
      />
    </div>
  );
}
