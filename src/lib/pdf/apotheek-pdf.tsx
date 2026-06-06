import React from 'react'
import {
  Document, Page, View, Text, StyleSheet,
} from '@react-pdf/renderer'
import { BTW_RATE, calcHours, fmtDate, fmtHours, fmtMoney, fmtMonth, fmtTime } from './pdf-utils'
import type { SenderInfo } from './assistent-pdf'

const C = {
  teal:      '#0d9488',
  tealDark:  '#0f766e',
  tealLight: '#f0fdfa',
  text:      '#0f172a',
  muted:     '#64748b',
  border:    '#e2e8f0',
  white:     '#ffffff',
  rowAlt:    '#f8fafc',
}

const s = StyleSheet.create({
  page:        { fontFamily: 'Helvetica', fontSize: 9, color: C.text, paddingHorizontal: 44, paddingVertical: 40 },

  titleBar:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 },
  docTitle:    { fontSize: 18, fontFamily: 'Helvetica-Bold', color: C.teal },
  docMeta:     { alignItems: 'flex-end', gap: 2 },
  docMetaLine: { fontSize: 8, color: C.muted },

  parties:     { flexDirection: 'row', gap: 16, marginBottom: 24 },
  partyBox:    { flex: 1, borderWidth: 0.5, borderColor: C.border, borderRadius: 3, padding: 12 },
  partyLabel:  { fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.teal, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  partyName:   { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.text, marginBottom: 3 },
  partyLine:   { fontSize: 8.5, color: C.text, marginBottom: 2 },
  partyMuted:  { fontSize: 8, color: C.muted, marginBottom: 1 },

  divider:     { height: 0.5, backgroundColor: C.border, marginBottom: 18 },

  banner:      { backgroundColor: C.tealLight, borderLeft: 3, borderLeftColor: C.teal, paddingVertical: 7, paddingHorizontal: 11, marginBottom: 16 },
  bannerTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.tealDark },
  bannerSub:   { fontSize: 7.5, color: C.muted, marginTop: 2 },

  table:       { marginBottom: 20 },
  thead:       { flexDirection: 'row', backgroundColor: C.teal },
  th:          { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: C.white, paddingVertical: 6, paddingHorizontal: 5 },
  trow:        { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: C.border },
  trowAlt:     { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: C.border, backgroundColor: C.rowAlt },
  td:          { fontSize: 8.5, color: C.text, paddingVertical: 5, paddingHorizontal: 5 },
  tdMuted:     { fontSize: 8, color: C.muted, paddingVertical: 5, paddingHorizontal: 5 },

  colDate:     { width: '13%' },
  colAsst:     { width: '20%' },
  colLoc:      { width: '19%' },
  colStart:    { width: '8%' },
  colEnd:      { width: '8%' },
  colBreak:    { width: '8%' },
  colHours:    { width: '9%' },
  colRate:     { width: '8%' },
  colAmount:   { width: '7%', textAlign: 'right' },

  totalsWrap:  { alignItems: 'flex-end', marginBottom: 20 },
  totalsBox:   { width: 230 },
  totRow:      { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  totLabel:    { fontSize: 8.5, color: C.muted },
  totValue:    { fontSize: 8.5, color: C.text },
  totDivider:  { height: 0.5, backgroundColor: C.border, marginVertical: 4 },
  totRowBold:  { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  totLabelB:   { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.tealDark },
  totValueB:   { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.tealDark },

  footer:      { position: 'absolute', bottom: 28, left: 44, right: 44, borderTopWidth: 0.5, borderTopColor: C.border, paddingTop: 7 },
  footerText:  { fontSize: 7.5, color: C.muted, textAlign: 'center' },
})

export type ApotheekPDFShift = {
  id:            string
  date:          string
  startTime:     string
  endTime:       string
  breakMinutes:  number
  assistantName: string
  locationName:  string
  hourlyRate:    number
}

export type ApotheekPDFData = {
  month:           string
  companyName:     string | null
  vatNumber:       string | null
  billingStreet:   string | null
  billingHouseNr:  string | null
  billingPostcode: string | null
  billingCity:     string | null
  shifts:          ApotheekPDFShift[]
  invoiceNumber?:  string
  invoiceDate?:    string
  sender:          SenderInfo
}

export function ApotheekDocument({ data }: { data: ApotheekPDFData }) {
  const today = new Date().toLocaleDateString('nl-BE', { day: '2-digit', month: '2-digit', year: 'numeric' })

  const subtotal   = data.shifts.reduce((sum, s) => sum + calcHours(s.startTime, s.endTime, s.breakMinutes) * s.hourlyRate, 0)
  const btwAmount  = subtotal * BTW_RATE
  const total      = subtotal + btwAmount
  const totalHours = data.shifts.reduce((sum, s) => sum + calcHours(s.startTime, s.endTime, s.breakMinutes), 0)

  const recipientAddr = [
    [data.billingStreet, data.billingHouseNr].filter(Boolean).join(' '),
    [data.billingPostcode, data.billingCity].filter(Boolean).join(' '),
  ].filter(Boolean)

  return (
    <Document>
      <Page size="A4" style={s.page} orientation="landscape">

        {/* Title bar */}
        <View style={s.titleBar}>
          <Text style={s.docTitle}>
            {data.invoiceNumber ? `FACTUUR ${data.invoiceNumber}` : 'Overzicht Prestaties Apotheek'}
          </Text>
          <View style={s.docMeta}>
            {data.invoiceDate
              ? <Text style={s.docMetaLine}>Factuurdatum: {new Date(data.invoiceDate + 'T00:00:00').toLocaleDateString('nl-BE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</Text>
              : <Text style={s.docMetaLine}>Maand: {fmtMonth(data.month)}</Text>
            }
            <Text style={s.docMetaLine}>Opgesteld: {today}</Text>
          </View>
        </View>

        {/* VAN / AAN */}
        <View style={s.parties}>
          <View style={s.partyBox}>
            <Text style={s.partyLabel}>Van</Text>
            <Text style={s.partyName}>{data.sender.name}</Text>
            <Text style={s.partyLine}>{data.sender.street}</Text>
            <Text style={s.partyLine}>{data.sender.city}</Text>
            <Text style={s.partyMuted}>{data.sender.phone}</Text>
            <Text style={s.partyMuted}>{data.sender.email}</Text>
            <Text style={s.partyMuted}>BTW: {data.sender.vat}</Text>
          </View>
          <View style={s.partyBox}>
            <Text style={s.partyLabel}>Aan</Text>
            {data.companyName && <Text style={s.partyName}>{data.companyName}</Text>}
            {recipientAddr.map((line, i) => <Text key={i} style={s.partyLine}>{line}</Text>)}
            {data.vatNumber && <Text style={s.partyMuted}>BTW: {data.vatNumber}</Text>}
          </View>
        </View>

        <View style={s.divider} />

        {/* Month banner */}
        <View style={s.banner}>
          <Text style={s.bannerTitle}>Ingeplande shifts — {fmtMonth(data.month)}</Text>
          <Text style={s.bannerSub}>{data.shifts.length} shift{data.shifts.length !== 1 ? 's' : ''} · {fmtHours(totalHours)} totaal</Text>
        </View>

        {/* Shifts table */}
        <View style={s.table}>
          <View style={s.thead}>
            <Text style={[s.th, s.colDate]}>Datum</Text>
            <Text style={[s.th, s.colAsst]}>Assistent</Text>
            <Text style={[s.th, s.colLoc]}>Locatie</Text>
            <Text style={[s.th, s.colStart]}>Start</Text>
            <Text style={[s.th, s.colEnd]}>Eind</Text>
            <Text style={[s.th, s.colBreak]}>Pauze</Text>
            <Text style={[s.th, s.colHours]}>Uren</Text>
            <Text style={[s.th, s.colRate]}>Tarief</Text>
            <Text style={[s.th, s.colAmount]}>Bedrag</Text>
          </View>
          {data.shifts.map((shift, i) => {
            const hours = calcHours(shift.startTime, shift.endTime, shift.breakMinutes)
            const Row   = i % 2 === 0 ? s.trow : s.trowAlt
            return (
              <View key={shift.id} style={Row}>
                <Text style={[s.td,     s.colDate]}>{fmtDate(shift.date)}</Text>
                <Text style={[s.td,     s.colAsst]}>{shift.assistantName}</Text>
                <Text style={[s.tdMuted,s.colLoc]}>{shift.locationName}</Text>
                <Text style={[s.td,     s.colStart]}>{fmtTime(shift.startTime)}</Text>
                <Text style={[s.td,     s.colEnd]}>{fmtTime(shift.endTime)}</Text>
                <Text style={[s.tdMuted,s.colBreak]}>{shift.breakMinutes ? `${shift.breakMinutes} min` : '—'}</Text>
                <Text style={[s.td,     s.colHours]}>{fmtHours(hours)}</Text>
                <Text style={[s.tdMuted,s.colRate]}>€{shift.hourlyRate}/u</Text>
                <Text style={[s.td,     s.colAmount]}>{fmtMoney(hours * shift.hourlyRate)}</Text>
              </View>
            )
          })}
        </View>

        {/* Totals */}
        <View style={s.totalsWrap}>
          <View style={s.totalsBox}>
            <View style={s.totRow}>
              <Text style={s.totLabel}>Totaal uren</Text>
              <Text style={s.totValue}>{fmtHours(totalHours)}</Text>
            </View>
            <View style={s.totDivider} />
            <View style={s.totRow}>
              <Text style={s.totLabel}>Subtotaal excl. BTW</Text>
              <Text style={s.totValue}>{fmtMoney(subtotal)}</Text>
            </View>
            <View style={s.totRow}>
              <Text style={s.totLabel}>BTW 21%</Text>
              <Text style={s.totValue}>{fmtMoney(btwAmount)}</Text>
            </View>
            <View style={s.totDivider} />
            <View style={s.totRowBold}>
              <Text style={s.totLabelB}>TOTAAL incl. BTW</Text>
              <Text style={s.totValueB}>{fmtMoney(total)}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            {data.sender.name} · {data.sender.street}, {data.sender.city} · {data.sender.phone} · {data.sender.email} · BTW: {data.sender.vat}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
