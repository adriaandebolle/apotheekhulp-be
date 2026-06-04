import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')
  if (!q || q.trim().length < 3) return NextResponse.json([])

  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', q.trim())
  url.searchParams.set('countrycodes', 'be')
  url.searchParams.set('format', 'json')
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('limit', '6')

  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': 'Apotheekhulp/1.0 (info@apotheekhulp.be)' },
    next: { revalidate: 300 },
  })

  if (!res.ok) return NextResponse.json([])
  const data = await res.json()
  return NextResponse.json(data)
}
