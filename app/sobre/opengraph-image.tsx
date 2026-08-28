import { ImageResponse } from 'next/og';

export const alt = 'Imagine Apps — Sobre nós';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#050a10', color: '#fff', padding: '72px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', color: '#0098da', fontSize: 28, fontWeight: 700 }}>IMAGINE APPS · DESDE 2014</div>
      <div style={{ display: 'flex', flexDirection: 'column', fontSize: 80, fontWeight: 800, lineHeight: 1, letterSpacing: '-3px' }}>
        <span>CONSTRUINDO O</span>
        <span style={{ color: '#0098da' }}>IMAGINÁVEL.</span>
      </div>
      <div style={{ display: 'flex', color: '#9fb0be', fontSize: 26 }}>Tecnologia que transforma complexidade em resultados.</div>
    </div>,
    size,
  );
}
