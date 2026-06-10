'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
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

  const supabase = await createClient()

  // Only one popup at a time — clear others first
  if (data.show_as_popup) {
    await supabase.from('messages').update({ show_as_popup: false }).eq('show_as_popup', true)
  }

  const { data: row, error } = await supabase
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

  if (data.notify_assistants || data.notify_pharmacies) {
    const roles = [
      ...(data.notify_assistants ? ['assistent'] : []),
      ...(data.notify_pharmacies ? ['apotheek']  : []),
    ]
    const { data: userRows } = await supabase
      .from('users')
      .select('email, role')
      .in('role', roles)
      .eq('is_active', true)
      .not('email', 'is', null)

    if (data.notify_assistants) {
      const emails = (userRows ?? []).filter(u => u.role === 'assistent' && u.email).map(u => u.email!)
      await sendBerichtNotification(emails, data.title.trim(), data.body.trim(), 'assistent')
    }
    if (data.notify_pharmacies) {
      const emails = (userRows ?? []).filter(u => u.role === 'apotheek' && u.email).map(u => u.email!)
      await sendBerichtNotification(emails, data.title.trim(), data.body.trim(), 'apotheek')
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
  const supabase = await createClient()

  if (data.show_as_popup) {
    await supabase.from('messages').update({ show_as_popup: false }).eq('show_as_popup', true).neq('id', id)
  }

  const { error } = await supabase
    .from('messages')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { error: error.message }

  if (data.notify_assistants || data.notify_pharmacies) {
    const title = data.title ?? ''
    const body  = data.body  ?? ''
    const roles = [
      ...(data.notify_assistants ? ['assistent'] : []),
      ...(data.notify_pharmacies ? ['apotheek']  : []),
    ]
    const { data: userRows } = await supabase
      .from('users')
      .select('email, role')
      .in('role', roles)
      .eq('is_active', true)
      .not('email', 'is', null)

    if (data.notify_assistants) {
      const emails = (userRows ?? []).filter(u => u.role === 'assistent' && u.email).map(u => u.email!)
      await sendBerichtNotification(emails, title, body, 'assistent')
    }
    if (data.notify_pharmacies) {
      const emails = (userRows ?? []).filter(u => u.role === 'apotheek' && u.email).map(u => u.email!)
      await sendBerichtNotification(emails, title, body, 'apotheek')
    }
  }

  revalidatePath('/admin/berichten')
  return { data: undefined }
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  const admin = await createClient()
  const { error } = await admin.from('messages').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/berichten')
  return { data: undefined }
}
