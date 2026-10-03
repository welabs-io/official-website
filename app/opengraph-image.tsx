import { ImageResponse } from 'next/og';

export const alt = 'Imagine Apps — Desenvolvimento de software sob medida';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#050a10', color: '#fff', padding: '72px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', color: '#0098da', fontSize: 28, fontWeight: 700 }}>IMAGINE APPS</div>
      <div style={{ display: 'flex', flexDirection: 'column', fontSize: 76, fontWeight: 800, lineHeight: 1.02, letterSpacing: '-3px' }}>
        <span>SOFTWARE COM</span>
        <span style={{ color: '#0098da' }}>CONTEXTO DE NEGÓCIO.</span>
      </div>
      <div style={{ display: 'flex', color: '#9fb0be', fontSize: 26 }}>Design de produto • Software sob medida • Evolução</div>
    </div>,
    size,
  );
}
