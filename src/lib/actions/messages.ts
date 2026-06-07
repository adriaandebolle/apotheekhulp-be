'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendBerichtNotification } from '@/lib/email'

type ActionResult<T = void> = { error: string } | { data: T }

export async function createMessage(data: {
  title: string
  body: string
  show_as_popup?: boolean
  notify_assistants?: boolean
  notify_pharmacies?: boolean
}): Promise<ActionResult<{ id: string }>> {
  if (!data.title?.trim() || !data.body?.trim()) return { error: 'Titel en inhoud zijn verplicht.' }

  const admin = createAdminClient()

  // Only one popup at a time — clear others first
  if (data.show_as_popup) {
    await admin.from('messages').update({ show_as_popup: false }).eq('show_as_popup', true)
  }

  const { data: row, error } = await admin
    .from('messages')
    .insert({
      title:              data.title.trim(),
      body:               data.body.trim(),
      show_as_popup:      data.show_as_popup      ?? false,
      notify_assistants:  data.notify_assistants  ?? false,
      notify_pharmacies:  data.notify_pharmacies  ?? false,
    })
    .select('id')
    .single()
  if (error) return { error: error.message }

  // Send notification emails in the background (don't block the response)
  if (data.notify_assistants || data.notify_pharmacies) {
    const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 })

    if (data.notify_assistants) {
      const assistantEmails = users
        .filter(u => u.app_metadata?.role === 'assistent' && u.email)
        .map(u => u.email!)
      await sendBerichtNotification(assistantEmails, data.title.trim(), data.body.trim(), 'assistent')
    }

    if (data.notify_pharmacies) {
      const pharmacyEmails = users
        .filter(u => u.app_metadata?.role === 'apotheek' && u.email)
        .map(u => u.email!)
      await sendBerichtNotification(pharmacyEmails, data.title.trim(), data.body.trim(), 'apotheek')
    }
  }

  revalidatePath('/admin/berichten')
  return { data: { id: row.id } }
}

export async function updateMessage(
  id: string,
  data: {
    title?: string
    body?: string
    show_as_popup?: boolean
    notify_assistants?: boolean
    notify_pharmacies?: boolean
  },
): Promise<ActionResult> {
  const admin = createAdminClient()

  if (data.show_as_popup) {
    await admin.from('messages').update({ show_as_popup: false }).eq('show_as_popup', true).neq('id', id)
  }

  const { error } = await admin
    .from('messages')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { error: error.message }

  // Re-send notifications if checked
  if (data.notify_assistants || data.notify_pharmacies) {
    const title = data.title ?? ''
    const body  = data.body  ?? ''
    const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 })

    if (data.notify_assistants) {
      const emails = users.filter(u => u.app_metadata?.role === 'assistent' && u.email).map(u => u.email!)
      await sendBerichtNotification(emails, title, body, 'assistent')
    }
    if (data.notify_pharmacies) {
      const emails = users.filter(u => u.app_metadata?.role === 'apotheek' && u.email).map(u => u.email!)
      await sendBerichtNotification(emails, title, body, 'apotheek')
    }
  }

  revalidatePath('/admin/berichten')
  return { data: undefined }
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  const admin = createAdminClient()
  const { error } = await admin.from('messages').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/berichten')
  return { data: undefined }
}
