import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEffectiveUserId } from "@/lib/effective-user-id";
import KalenderApotheekWrapper from "./KalenderApotheekWrapper";

export type ShiftData = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  status: "pending_assistant" | "pending_apotheek" | "approved" | "denied";
  locationName: string;
  assistantName: string;
};

export type Assistent = {
  id: string;
  first_name: string | null;
  last_name: string | null;
};

export type LocationOption = {
  id: string;
  name: string;
};

// { assistantId, dayOfWeek } — days the assistant CANNOT work (0=Mon…6=Sun)
export type UnavailabilityEntry = {
  assistantId: string;
  dayOfWeek: number;
};

// Booked slots: assistant already has a non-denied shift on this date
export type BookedSlot = {
  date: string;
  assistantId: string;
};

function dateRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 4, 0);
  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
}

export default async function ApotheekKalenderPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const effectiveId = await getEffectiveUserId(user.id);
  const admin = await createClient();

  const [
    { data: rawLocations },
    { data: rawAssistants },
    { data: rawUnavailability },
  ] = await Promise.all([
    admin
      .from("locations")
      .select("id, name")
      .eq("pharmacy_id", effectiveId)
      .is("deleted_at", null)
      .order("name"),
    admin
      .from("users")
      .select("id, first_name, last_name")
      .eq("role", "assistent")
      .eq("is_active", true)
      .order("last_name"),
    admin
      .from("assistant_availability")
      .select("assistant_id, day_of_week"),
  ]);

  const locations: LocationOption[] = (rawLocations ?? []).map((l) => ({
    id: l.id,
    name: l.name,
  }));

  const assistants: Assistent[] = (rawAssistants ?? []).map((a) => ({
    id: a.id,
    first_name: a.first_name,
    last_name: a.last_name,
  }));

  const unavailability: UnavailabilityEntry[] = (rawUnavailability ?? []).map(
    (r) => ({ assistantId: r.assistant_id, dayOfWeek: r.day_of_week })
  );

  const locationIds = locations.map((l) => l.id);
  const { start, end } = dateRange();

  const { data: rawShifts } =
    locationIds.length === 0
      ? { data: [] }
      : await admin
          .from("shifts")
          .select(
            `id, date, start_time, end_time, break_minutes, status, assistant_id,
            assistant:users(first_name, last_name),
            location:locations(name)`
          )
          .in("location_id", locationIds)
          .is("deleted_at", null)
          .gte("date", start)
          .lte("date", end);

  const shifts: ShiftData[] = (rawShifts ?? []).map((s) => {
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
      status: s.status as ShiftData["status"],
      locationName: loc?.name ?? "—",
      assistantName: asst
        ? [asst.first_name, asst.last_name].filter(Boolean).join(" ")
        : "—",
    };
  });

  // Assistants already booked on a date (any non-denied shift)
  const bookedSlots: BookedSlot[] = (rawShifts ?? [])
    .filter((s) => s.status !== "denied" && s.assistant_id)
    .map((s) => ({ date: s.date, assistantId: s.assistant_id as string }));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <KalenderApotheekWrapper
        shifts={shifts}
        assistants={assistants}
        locations={locations}
        unavailability={unavailability}
        bookedSlots={bookedSlots}
      />
    </div>
  );
}
