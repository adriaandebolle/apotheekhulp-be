import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getEffectiveUserId } from "@/lib/effective-user-id";
import BeschikbaarheidAssistentClient from "./BeschikbaarheidAssistentClient";

export default async function AssistentOnbeschikbaarheidPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const effectiveId = await getEffectiveUserId(user.id);
  const admin = createAdminClient();
  const { data: rows } = await admin
    .from("assistant_availability")
    .select("day_of_week")
    .eq("assistant_id", effectiveId);

  // Rows represent days the assistant CANNOT work (unavailability)
  const unavailable = new Set<number>((rows ?? []).map((r) => r.day_of_week));

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-text mb-1">Onbeschikbaarheid</h1>
      <p className="text-text-muted mb-6">
        Vink aan op welke dagen je <strong>niet</strong> beschikbaar bent.
        Standaard ben je elke dag beschikbaar.
      </p>
      <BeschikbaarheidAssistentClient unavailable={unavailable} />
    </div>
  );
}
