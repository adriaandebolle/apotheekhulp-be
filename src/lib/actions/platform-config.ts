"use server";

import { revalidatePath } from "next/cache";
import { createClient } from '@/lib/supabase/server'

type ActionResult<T = void> = { error: string } | { data: T };

export type PlatformConfig = {
  km_rate: number;
  vat_rate: number;
  default_hourly_rate_assistant: number;
  default_hourly_rate_pharmacy: number;
  invoice_prefix: string;
  invoice_next_number: number;
  company_name: string;
  company_street: string;
  company_city: string;
  company_phone: string;
  company_email: string;
  company_vat: string;
};

export async function getPlatformConfig(): Promise<PlatformConfig> {
  const admin = await createClient();
  const { data } = await admin
    .from("platform_config")
    .select(
      "km_rate, vat_rate, default_hourly_rate_assistant, default_hourly_rate_pharmacy, invoice_prefix, invoice_next_number, company_name, company_street, company_city, company_phone, company_email, company_vat",
    )
    .single();
  return {
    km_rate: Number(data?.km_rate ?? 0.4326),
    vat_rate: Number(data?.vat_rate ?? 21),
    default_hourly_rate_assistant: Number(data?.default_hourly_rate_assistant ?? 0),
    default_hourly_rate_pharmacy: Number(data?.default_hourly_rate_pharmacy ?? 0),
    invoice_prefix: data?.invoice_prefix ?? "2026",
    invoice_next_number: Number(data?.invoice_next_number ?? 1),
    company_name:   data?.company_name   ?? "Apotheekhulp",
    company_street: data?.company_street ?? "Wanzelesteenweg 98",
    company_city:   data?.company_city   ?? "9260 Serskamp",
    company_phone:  data?.company_phone  ?? "0494/99.61.82",
    company_email:  data?.company_email  ?? "info@apotheekhulp.be",
    company_vat:    data?.company_vat    ?? "BE1010.352.295",
  };
}

export async function updatePlatformConfig(
  config: Partial<PlatformConfig>,
): Promise<ActionResult> {
  const admin = await createClient();
  const { error } = await admin
    .from("platform_config")
    .update({ ...config, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) return { error: error.message };

  revalidatePath("/admin/instellingen");
  return { data: undefined };
}
