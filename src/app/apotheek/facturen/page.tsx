import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getEffectiveUserId } from '@/lib/effective-user-id'
import { Badge } from '@/components/ui/Badge'
import { Table, Thead, Tbody, Th, Td, Tr, EmptyRow } from '@/components/ui/Table'

const STATUS_LABEL: Record<string, string> = {
  te_betalen: 'Te betalen',
  betaald:    'Betaald',
}

function formatCurrency(n: number) {
  return `€ ${n.toFixed(2).replace('.', ',')}`
}

export default async function ApotheekFacturenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const effectiveId = await getEffectiveUserId(user.id)
  const admin = await createClient()
  const { data: invoices } = await admin
    .from('invoices')
    .select('id, invoice_number, invoice_date, status, subtotal, vat_amount, total')
    .eq('type', 'apotheek')
    .eq('recipient_id', effectiveId)
    .order('invoice_date', { ascending: false })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-text mb-6">Mijn facturen</h1>

      <Table>
        <Thead>
          <Tr>
            <Th>Factuurnr.</Th>
            <Th>Datum</Th>
            <Th>Bedrag excl.</Th>
            <Th>BTW</Th>
            <Th>Totaal</Th>
            <Th>Status</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {(invoices ?? []).length === 0 ? (
            <EmptyRow colSpan={7} message="Nog geen facturen beschikbaar." />
          ) : (
            (invoices ?? []).map(inv => (
              <Tr key={inv.id}>
                <Td className="font-mono text-sm">{inv.invoice_number}</Td>
                <Td>{new Date(inv.invoice_date).toLocaleDateString('nl-BE')}</Td>
                <Td>{formatCurrency(Number(inv.subtotal))}</Td>
                <Td>{formatCurrency(Number(inv.vat_amount))}</Td>
                <Td className="font-medium">{formatCurrency(Number(inv.total))}</Td>
                <Td>
                  <Badge status={inv.status}>{STATUS_LABEL[inv.status] ?? inv.status}</Badge>
                </Td>
                <Td>
                  <a
                    href={`/api/pdf/apotheek?invoice_id=${inv.id}`}
                    download={`factuur-${inv.invoice_number}.pdf`}
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    PDF
                  </a>
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </div>
  )
}
