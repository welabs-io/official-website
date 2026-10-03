import { ImageResponse } from 'next/og';

export const alt = 'Welabs — Empresa e produtos';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#050a10', color: '#fff', padding: '72px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', color: '#FF452B', fontSize: 28, fontWeight: 700 }}>WELABS</div>
      <div style={{ display: 'flex', flexDirection: 'column', fontSize: 76, fontWeight: 800, lineHeight: 1.02, letterSpacing: '-3px' }}>
        <span>CRIAMOS PRODUTOS.</span>
        <span style={{ color: '#FF452B' }}>CONECTAMOS OPERAÇÕES.</span>
      </div>
      <div style={{ display: 'flex', color: '#9fb0be', fontSize: 26 }}>ERP • Flow • KB • CRM • Monitoramento</div>
    </div>,
    size,
  );
}
