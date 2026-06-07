import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { calcHours } from "@/lib/pdf/pdf-utils";
import { Badge } from "@/components/ui/Badge";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("nl-BE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatTime(t: string) {
  return t.slice(0, 5);
}

export default async function AssistentDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const todayIso = now.toISOString().split("T")[0];

  const SHIFT_SELECT = `id, date, start_time, end_time, break_minutes, status,
    location:locations(name, pharmacy:pharmacy_profiles(company_name))`;

  const [pendingRes, monthRes, upcomingRes] = await Promise.all([
    admin
      .from("shifts")
      .select("id", { count: "exact", head: true })
      .eq("assistant_id", user.id)
      .eq("status", "pending_assistant")
      .is("deleted_at", null),
    admin
      .from("shifts")
      .select(SHIFT_SELECT)
      .eq("assistant_id", user.id)
      .eq("status", "approved")
      .is("deleted_at", null)
      .gte("date", monthStart),
    admin
      .from("shifts")
      .select(SHIFT_SELECT)
      .eq("assistant_id", user.id)
      .eq("status", "approved")
      .is("deleted_at", null)
      .gte("date", todayIso)
      .order("date", { ascending: true })
      .limit(5),
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
    pharmacyName: string;
    locationName: string;
  };

  const upcoming: UpcomingShift[] = (upcomingRes.data ?? []).map((s) => {
    const loc = s.location as unknown as {
      name: string;
      pharmacy: { company_name: string | null } | null;
    } | null;
    return {
      id: s.id,
      date: s.date,
      startTime: s.start_time,
      endTime: s.end_time,
      pharmacyName: loc?.pharmacy?.company_name ?? "—",
      locationName: loc?.name ?? "—",
    };
  });

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-text mb-6">Dashboard</h1>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
          <p className="text-sm text-text-muted mb-1">Te bevestigen</p>
          <p className="text-3xl font-bold text-text">{pendingCount}</p>
          {pendingCount > 0 && (
            <p className="text-xs text-warning mt-1">Actie vereist</p>
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
                    {s.pharmacyName} – {s.locationName}
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
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          Je hebt <strong>{pendingCount}</strong> shift
          {pendingCount > 1 ? "s" : ""} die wacht
          {pendingCount === 1 ? "" : "en"} op jouw bevestiging.{" "}
          <a href="/assistent/prestaties" className="font-medium underline">
            Bekijk prestaties →
          </a>
        </div>
      )}
    </div>
  );
}
