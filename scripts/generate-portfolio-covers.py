"""Generate original SVG illustrations from synthetic demo data only."""
from pathlib import Path
from html import escape
import json
import base64
import mimetypes
import re

ROOT = Path(__file__).resolve().parents[1]
raw = (ROOT / 'lib/portfolio.ts').read_text()
PRODUCTS = json.loads(raw.split('export const portfolio = ', 1)[1].split(' as const;', 1)[0])

BRANDS = json.loads((ROOT / "lib/portfolio-brands.json").read_text())

def cover(p):
    accent = p['color']
    out = [f'''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="860" viewBox="0 0 1200 860" role="img" aria-labelledby="title desc">
<title id="title">{escape(p['title'])} — apresentação ilustrativa</title><desc id="desc">Recriação conceitual com dados fictícios. Não é captura do sistema em produção.</desc>
<defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#e8f0f0"/><stop offset="1" stop-color="{accent}" stop-opacity=".25"/></linearGradient><filter id="shadow" x="-30%" y="-30%" width="170%" height="180%"><feDropShadow dx="0" dy="24" stdDeviation="24" flood-color="#173139" flood-opacity=".18"/></filter></defs>
<rect width="1200" height="860" fill="url(#bg)"/><circle cx="1130" cy="-80" r="400" fill="{accent}" opacity=".13"/>
<g fill="none" stroke="#294047" opacity=".09"><path d="M0 140H1200M0 810H1200M55 0V860M1145 0V860"/></g>
<g font-family="Inter,Arial,sans-serif"><text x="70" y="65" font-size="13" fill="#587079" letter-spacing="3">{escape(p['sector'].upper())}</text><text x="68" y="126" font-size="44" font-weight="700" fill="#14252a">{escape(p['title'])}</text>
<rect x="72" y="185" width="1020" height="560" rx="14" fill="#ffffff" filter="url(#shadow)"/>
<path d="M86 185H1078Q1092 185 1092 199V224H72V199Q72 185 86 185" fill="#f9fbfb"/>
<g fill="#c2ced0"><circle cx="94" cy="204" r="4"/><circle cx="108" cy="204" r="4"/><circle cx="122" cy="204" r="4"/></g>
<rect x="380" y="195" width="365" height="18" rx="6" fill="#eaf0f1"/><text x="562" y="208" text-anchor="middle" font-size="10" fill="#70878c">ambiente de demonstração</text>
<path d="M72 224H237V745H86Q72 745 72 731" fill="#17292e"/><text x="94" y="261" fill="white" font-size="17" font-weight="700">{escape(p['title'][:17])}</text>
<text x="94" y="291" fill="#869da3" font-size="10" letter-spacing="2">ESPAÇO DE TRABALHO</text>
<rect x="86" y="316" width="137" height="35" rx="6" fill="{accent}" opacity=".22"/>''']
    def text(x, y, s, size=14, fill='#273c42', weight='400'):
        out.append(f'<text x="{x}" y="{y}" font-size="{size}" fill="{fill}" font-weight="{weight}">{escape(str(s))}</text>')
    def rect(x,y,w,h,fill='#f1f5f5',r=8,stroke=None):
        out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}"'+(f' stroke="{stroke}"' if stroke else '')+'/>')
    for i, label in enumerate([p['module'],'Visão geral','Atividades','Documentos']):
        text(108,338+i*47,label,12,'#f5fafb' if i==0 else '#a8bdc2')
    text(94,709,'DEMONSTRAÇÃO',9,'#849ba2')
    text(271,263,p['example'],21,weight='700');text(271,287,'Uma visão da jornada do produto',12,'#8a9ca2')
    rect(965,249,91,28,accent);text(980,268,'Visão geral',10)
    visual=p['visual']
    if visual=='matrix':
        for i,(label,value) in enumerate([('Disponíveis','18'),('Em análise','06'),('Reservadas','04')]):
            rect(271+i*255,315,239,81);text(288+i*255,340,label,11,'#789099');text(288+i*255,376,value,28,weight='700')
        text(272,429,'Disponibilidade por unidade',15,weight='700')
        for row in range(4):
            text(273,473+row*56,f'{row+1:02d}',12,'#8a9ca2')
            for col in range(7):
                x=316+col*99;y=447+row*56;rect(x,y,86,43,accent if (col+row)%5==0 else '#edf2f3')
                text(x+16,y+26,f'{row+1}0{col+1}',12)
    elif visual=='chart':
        for i,(label,value) in enumerate([('Ambiental','68'),('Social','24'),('Governança','16')]):
            rect(271+i*255,315,239,81);text(288+i*255,340,label,11,'#789099');text(288+i*255,376,value,28,weight='700')
        rect(271,417,460,266);text(291,448,'Evolução dos indicadores',14,weight='700')
        for y in [478,528,578,628]:out.append(f'<path d="M292 {y}H713" stroke="#dfe8e9"/>')
        for i,h in enumerate([40,75,62,112,93,138,122,157]):rect(306+i*49,639-h,29,h,accent,4)
        rect(750,417,290,266);text(770,448,'Dimensões ESG',14,weight='700')
        for i,label in enumerate(['Ambiental','Social','Governança']):
            text(770,487+i*58,label,12);rect(770,498+i*58,244,6,'#dfe9e9',3);rect(770,498+i*58,160-i*31,6,accent,3)
    elif visual=='kanban':
        for col,(label,cards) in enumerate([('Primeiro contato',3),('Em acompanhamento',2),('Próxima etapa',3)]):
            x=271+col*256;rect(x,315,237,371);text(x+15,345,label,12,weight='700')
            for row in range(cards):
                y=367+row*95;rect(x+12,y,213,80,'white',8);rect(x+25,y+14,56,5,accent,2)
                text(x+25,y+40,f'Oportunidade exemplo {col*3+row+1:02d}',12,weight='600');text(x+25,y+62,'Acompanhamento comercial',10,'#82989d')
    elif visual=='workflow':
        text(272,335,'Jornada do processo',14,weight='700')
        for i,label in enumerate(['Entrada','Validação','Análise','Conclusão']):
            x=275+i*193;rect(x,390,163,101,'#f0f4f5',9,'#dbe5e6');rect(x+14,404,26,26,accent,7);text(x+22,422,i+1,11);text(x+14,457,label,13,weight='600')
            if i<3:out.append(f'<path d="M{x+164} 440H{x+192}" stroke="#99b0b6" stroke-width="2"/>')
        rect(271,532,768,145);text(292,564,'Atividades do processo exemplo',14,weight='700')
        for i,label in enumerate(['Documento recebido','Análise em andamento','Próxima etapa definida']):text(308,594+i*27,label,12,'#6b858c');rect(291,584+i*27,6,6,accent,3)
    elif visual=='knowledge':
        rect(271,315,767,48);text(289,345,'Buscar contexto na base de demonstração…',13,'#6e858c')
        for i,label in enumerate(['Documentos','Projetos','Reuniões']):
            y=382+i*96;rect(271,y,462,80);text(292,y+30,label,14,weight='700');text(292,y+54,'Fonte exemplo • contexto relacionado',12,'#83979c')
        rect(753,382,285,275)
        nodes=[(895,470),(810,435),(980,435),(815,573),(980,573)]
        for x,y in nodes[1:]:out.append(f'<path d="M895 470L{x} {y}" stroke="#bbd1d0" stroke-width="2"/>')
        for i,(x,y) in enumerate(nodes):out.append(f'<circle cx="{x}" cy="{y}" r="{23 if i==0 else 15}" fill="{accent if i==0 else "#dde9e7"}"/>')
        text(775,633,'Conhecimento conectado',12,'#6b858c')
    else:
        for i,(label,value) in enumerate([('Em andamento','12'),('Concluídas','28'),('Próximas ações','04')]):
            rect(271+i*255,315,239,81);text(288+i*255,340,label,11,'#789099');text(288+i*255,376,value,28,weight='700')
        text(272,430,{'inspection':'Atividades em campo','recycling':'Registros da operação','program':'Acompanhamento de programas'}[visual],15,weight='700')
        for i in range(4):
            y=450+i*54;rect(271,y,769,45,'#f4f7f7',5)
            out.append(f'<circle cx="294" cy="{y+22}" r="8" fill="{accent}" opacity=".6"/>')
            text(314,y+27,f'{"Registro" if visual=="recycling" else "Atividade"} demonstração {i+1:02d}',12)
            text(615,y+27,'Equipe exemplo',11,'#83969c');rect(847,y+12,160,23,'#e2eded',5);text(866,y+28,'Em acompanhamento',10)
    if 'Aplicativo' in p['surfaces']:
        out.append('<rect x="914" y="344" width="215" height="407" rx="30" fill="#14252b" filter="url(#shadow)"/><rect x="923" y="354" width="197" height="387" rx="24" fill="#f9fbfb"/>')
        rect(981,360,82,17,'#14252b',9);text(941,410,p['title'][:19],15,weight='700');text(941,434,'Operação demonstração',10,'#83969c')
        rect(937,454,169,86,accent);text(952,481,'Sua próxima atividade',11);text(952,511,'Registro exemplo',14,weight='700')
        for i,label in enumerate(['Acompanhamento','Meus registros','Próximas etapas']):rect(937,558+i*48,169,39,'#eaf0f0',6);text(949,582+i*48,label,11)
        rect(989,724,64,4,'#14252b',2)
    text(72,807,'RECRIAÇÃO ILUSTRATIVA · DADOS FICTÍCIOS',11,'#60777e')
    text(1100,807,p['brand'].lower()+' / portfolio',12,'#60777e')
    brand = BRANDS.get(p['slug'], {})
    if brand.get('asset'):
        out[0] = re.sub(r'<text x="68" y="126"[^>]*>.*?</text>', '', out[0])
        asset = ROOT / 'public' / brand['asset'].lstrip('/')
        mime = mimetypes.guess_type(asset.name)[0]
        data = base64.b64encode(asset.read_bytes()).decode()
        # Embed original brand asset without recoloring or relying on external URLs.
        plate = '#14252a' if brand.get('plate') == 'dark' else '#ffffff'
        rect(68,78,350,70,plate,9)
        out.append(f'<image x="84" y="86" width="318" height="53" preserveAspectRatio="xMinYMid meet" href="data:{mime};base64,{data}"/>')
        text(450,125,p['title'],24,weight='600')
    # Keep the footer inside the viewBox.
    out = [element.replace('x="1100"','x="986"') for element in out]
    out.append('</g></svg>')
    return ''.join(out)

for product in PRODUCTS:
    (ROOT/'public'/product['cover'].lstrip('/')).write_text(cover(product))
print(f'{len(PRODUCTS)} original synthetic covers generated.')
