'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

type ActionResult<T = void> = { error: string } | { data: T }

export type PlatformConfig = {
  km_rate:                       number
  vat_rate:                      number
  default_hourly_rate_assistant: number
  default_hourly_rate_pharmacy:  number
}

export async function getPlatformConfig(): Promise<PlatformConfig> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('platform_config')
    .select('km_rate, vat_rate, default_hourly_rate_assistant, default_hourly_rate_pharmacy')
    .single()
  return {
    km_rate:                       Number(data?.km_rate                       ?? 0.4296),
    vat_rate:                      Number(data?.vat_rate                      ?? 21),
    default_hourly_rate_assistant: Number(data?.default_hourly_rate_assistant ?? 0),
    default_hourly_rate_pharmacy:  Number(data?.default_hourly_rate_pharmacy  ?? 0),
  }
}

export async function updatePlatformConfig(
  config: Partial<PlatformConfig>,
): Promise<ActionResult> {
  const admin = createAdminClient()
  const { error } = await admin
    .from('platform_config')
    .update({ ...config, updated_at: new Date().toISOString() })
    .eq('id', 1)
  if (error) return { error: error.message }

  revalidatePath('/admin/instellingen')
  return { data: undefined }
}
