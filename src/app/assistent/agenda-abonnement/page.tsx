import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AgendaAbonnementClient from "./AgendaAbonnementClient";

export default async function AgendaAbonnementPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data: userRow } = await admin
    .from("users")
    .select("ical_token")
    .eq("id", user.id)
    .single();

  const hdrs = await headers();
  const host = hdrs.get("host") ?? "www.apotheekhulp.be";
  const proto = host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? `${proto}://${host}`;
  const icalUrl = `${siteUrl}/api/ical/${userRow?.ical_token ?? ""}`;

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-text mb-6">Agenda-abonnement</h1>
      <AgendaAbonnementClient icalUrl={icalUrl} />
    </div>
  );
}
