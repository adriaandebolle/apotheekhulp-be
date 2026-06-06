'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

type ActionResult<T = void> = { error: string } | { data: T }

export async function createInvoice(input: {
  type:          'assistent' | 'apotheek'
  recipientId:   string
  invoiceNumber: string
  invoiceDate:   string   // ISO date YYYY-MM-DD
  shiftIds:      string[]
  subtotal:      number
  vatAmount:     number
  total:         number
}): Promise<ActionResult<{ id: string }>> {
  if (!input.invoiceNumber.trim()) return { error: 'Factuurnummer is verplicht.' }
  if (!input.shiftIds.length)      return { error: 'Selecteer minstens één shift.' }

  const admin = createAdminClient()

  const { data: invoice, error: insertError } = await admin
    .from('invoices')
    .insert({
      invoice_number: input.invoiceNumber.trim(),
      invoice_date:   input.invoiceDate,
      type:           input.type,
      recipient_id:   input.recipientId,
      subtotal:       input.subtotal,
      vat_amount:     input.vatAmount,
      total:          input.total,
    })
    .select('id')
    .single()

  if (insertError) return { error: insertError.message }

  const fkCol = input.type === 'assistent' ? 'assistent_invoice_id' : 'apotheek_invoice_id'
  const { error: updateError } = await admin
    .from('shifts')
    .update({ [fkCol]: invoice.id, updated_at: new Date().toISOString() })
    .in('id', input.shiftIds)

  if (updateError) return { error: updateError.message }

  // Increment the invoice counter for the appropriate party
  if (input.type === 'apotheek') {
    const { data: cfg } = await admin
      .from('platform_config')
      .select('invoice_next_number')
      .single()
    await admin
      .from('platform_config')
      .update({ invoice_next_number: (cfg?.invoice_next_number ?? 1) + 1, updated_at: new Date().toISOString() })
      .eq('id', 1)
  } else {
    const { data: prof } = await admin
      .from('assistant_profiles')
      .select('invoice_next_number')
      .eq('user_id', input.recipientId)
      .maybeSingle()
    await admin
      .from('assistant_profiles')
      .update({ invoice_next_number: (prof?.invoice_next_number ?? 1) + 1, updated_at: new Date().toISOString() })
      .eq('user_id', input.recipientId)
  }

  revalidatePath('/admin/facturen/assistenten')
  revalidatePath('/admin/facturen/apotheken')
  revalidatePath('/admin/prestaties')
  revalidatePath('/admin/instellingen')
  return { data: { id: invoice.id } }
}

export async function updateInvoiceStatus(
  id: string,
  status: 'te_betalen' | 'betaald',
): Promise<ActionResult> {
  const admin = createAdminClient()
  const { error } = await admin
    .from('invoices')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/facturen/assistenten')
  revalidatePath('/admin/facturen/apotheken')
  return { data: undefined }
}

export async function deleteInvoice(id: string): Promise<ActionResult> {
  const admin = createAdminClient()
  // ON DELETE SET NULL handles the FK on shifts automatically
  const { error } = await admin.from('invoices').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/facturen/assistenten')
  revalidatePath('/admin/facturen/apotheken')
  revalidatePath('/admin/prestaties')
  return { data: undefined }
}
