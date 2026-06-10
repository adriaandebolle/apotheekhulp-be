import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEffectiveUserId } from "@/lib/effective-user-id";
import ProfielAssistentClient from "./ProfielAssistentClient";

export type LinkRow = {
  id: string;
  pharmacyName: string;
  locationName: string;
  hourlyRate: number | null;
  kmAllowance: number | null;
  distanceKm: number | null;
  autoConfirmAssistent: boolean;
};

export default async function AssistentProfielPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const effectiveId = await getEffectiveUserId(user.id);
  const admin = await createClient();

  const [{ data: userRow }, { data: profile }, { data: rawLinks }] =
    await Promise.all([
      admin
        .from("users")
        .select("first_name, last_name, phone")
        .eq("id", effectiveId)
        .single(),
      admin
        .from("assistant_profiles")
        .select(
          "vat_number, vat_liable, company_name, street, house_number, postcode, city, iban, invoice_prefix, invoice_next_number",
        )
        .eq("user_id", effectiveId)
        .maybeSingle(),
      admin
        .from("links")
        .select(
          `id, hourly_rate_assistant, km_allowance, distance_km, auto_confirm_assistent,
           location:locations(name, pharmacy:pharmacy_profiles(company_name))`,
        )
        .eq("assistant_id", effectiveId)
        .is("deleted_at", null)
        .order("id"),
    ]);

  const links: LinkRow[] = (rawLinks ?? []).map((l) => {
    const loc = l.location as unknown as {
      name: string;
      pharmacy: { company_name: string | null } | null;
    } | null;
    return {
      id: l.id,
      pharmacyName: loc?.pharmacy?.company_name ?? "—",
      locationName: loc?.name ?? "—",
      hourlyRate: l.hourly_rate_assistant !== null ? Number(l.hourly_rate_assistant) : null,
      kmAllowance: l.km_allowance !== null ? Number(l.km_allowance) : null,
      distanceKm: l.distance_km !== null ? Number(l.distance_km) : null,
      autoConfirmAssistent: l.auto_confirm_assistent,
    };
  });

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-text mb-6">Mijn profiel</h1>
      <ProfielAssistentClient
        email={user.email ?? ""}
        user={{
          first_name: userRow?.first_name ?? null,
          last_name: userRow?.last_name ?? null,
          phone: userRow?.phone ?? null,
        }}
        assistantProfile={profile ?? null}
        links={links}
      />
    </div>
  );
}
