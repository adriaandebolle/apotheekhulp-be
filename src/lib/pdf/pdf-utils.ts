export const APOTHEEKHULP = {
  name:    'Apotheekhulp',
  street:  'Wanzelesteenweg 98',
  city:    '9260 Serskamp',
  phone:   '0494/99.61.82',
  email:   'info@apotheekhulp.be',
  vat:     'BE1010.352.295',
}

export const BTW_RATE = 0.21

export function calcHours(startTime: string, endTime: string, breakMinutes: number): number {
  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)
  const totalMin = (eh * 60 + em) - (sh * 60 + sm) - breakMinutes
  return Math.max(0, totalMin) / 60
}

export function fmtMoney(amount: number): string {
  return new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(amount)
}

export function fmtDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('nl-BE', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}

export function fmtMonth(ym: string): string {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('nl-BE', { month: 'long', year: 'numeric' })
}

export function fmtTime(t: string): string {
  return t.slice(0, 5)
}

export function fmtHours(h: number): string {
  return h.toFixed(2).replace('.', ',') + ' u'
}
