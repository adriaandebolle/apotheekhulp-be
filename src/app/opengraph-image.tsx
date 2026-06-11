import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const logoData = await readFile(join(process.cwd(), 'public/img/logo_apotheekhulp.png'))
  const logoSrc = `data:image/png;base64,${logoData.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
        }}
      >
        <img src={logoSrc} width={200} height={200} style={{ borderRadius: 24 }} />
        <div
          style={{
            marginTop: 32,
            fontSize: 64,
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '-1px',
          }}
        >
          Apotheekhulp
        </div>
        <div
          style={{
            marginTop: 12,
            fontSize: 28,
            color: 'rgba(255,255,255,0.85)',
          }}
        >
          Platform voor apotheekassistenten in België
        </div>
      </div>
    ),
    size,
  )
}
