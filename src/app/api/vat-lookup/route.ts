import { NextRequest, NextResponse } from 'next/server'

export type ParsedAddress = {
  street: string
  house_number: string
  postcode: string
  city: string
}

export type VatLookupResult =
  | { valid: true;  name: string; address: string; parsed_address: ParsedAddress }
  | { valid: false; error: string }

function parseViesAddress(raw: string): ParsedAddress {
  const lines = raw.split('\n').map(s => s.trim()).filter(Boolean)
    .filter(l => !['BELGIUM', 'BELGIQUE', 'BELGIË'].includes(l.toUpperCase()))

  // Line with postcode: "9260  WICHELEN" or "1000 BRUSSEL"
  const postcodeLine = lines.find(l => /^\d{4}\s/.test(l))
  let postcode = '', city = ''
  if (postcodeLine) {
    const m = postcodeLine.match(/^(\d{4})\s+(.+)$/)
    if (m) { postcode = m[1]; city = m[2] }
  }

  // First line is the street: "WANZELESTEENWEG 98" → split off the last token as house number
  const streetLine = lines[0] ?? ''
  const streetMatch = streetLine.match(/^(.+?)\s+(\S+)$/)

  return {
    street:       streetMatch?.[1] ?? streetLine,
    house_number: streetMatch?.[2] ?? '',
    postcode,
    city,
  }
}

export async function GET(request: NextRequest) {
  const raw = (request.nextUrl.searchParams.get('vat') ?? '').trim()
  if (!raw) return NextResponse.json({ valid: false, error: 'Geen BTW-nummer opgegeven.' })

  // Strip "BE" prefix and spaces/dots so we pass only the 10-digit number
  const number = raw.toUpperCase().replace(/^BE\s*/, '').replace(/[.\s]/g, '')
  if (!/^\d{10}$/.test(number)) {
    return NextResponse.json({ valid: false, error: 'Ongeldig formaat. Verwacht: BE 0000.000.000' })
  }

  const url = `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/BE/vat/${number}`
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Apotheekhulp/1.0 (info@apotheekhulp.be)' },
      next: { revalidate: 3600 },
    })
    if (!res.ok) return NextResponse.json({ valid: false, error: 'VIES is momenteel niet beschikbaar.' })

    const data = await res.json()
    if (!data.isValid) return NextResponse.json({ valid: false, error: 'BTW-nummer niet geldig of niet gevonden.' })

    const address = data.address ?? ''
    return NextResponse.json({
      valid:          true,
      name:           data.name ?? '',
      address,
      parsed_address: parseViesAddress(address),
    } satisfies VatLookupResult)
  } catch {
    return NextResponse.json({ valid: false, error: 'Fout bij opzoeken. Probeer opnieuw.' })
  }
}
