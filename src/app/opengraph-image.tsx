import { ImageResponse } from 'next/og'

/**
 * Default share-preview card for the whole site (LinkedIn, Slack, iMessage previews).
 * Next picks this up by file convention — no metadata wiring needed. Colours are
 * duplicated from tokens.css: ImageResponse renders standalone, outside the page's CSS.
 */

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          backgroundColor: '#0f1316',
          color: '#f1f6f8',
          fontFamily: 'monospace',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 16, height: 16, borderRadius: 999, backgroundColor: '#3d8bff' }} />
          <div style={{ fontSize: 28 }}>piotr purzycki</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', width: 56, borderTop: '3px solid #3d8bff' }} />
          <div style={{ display: 'flex', fontSize: 56, lineHeight: 1.25, maxWidth: 980 }}>
            Front-end developer, eleven years building for the web.
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 26, color: '#8496a0' }}>
          Wrocław · browser telephony · React · Next.js
        </div>
      </div>
    ),
    { ...size },
  )
}
