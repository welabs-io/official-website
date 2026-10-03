import type {Metadata,Viewport} from 'next';
export const viewport:Viewport={themeColor:'#FF452B'};
export const metadata:Metadata={title:'Welabs',description:'Empresa e produtos Welabs.',icons:{icon:'/company-brands/welabs-favicon.png'},authors:[{name:'Welabs'}],openGraph:{type:'website',siteName:'Welabs',title:'Welabs',description:'Empresa e produtos Welabs.'},twitter:{card:'summary_large_image',title:'Welabs',description:'Empresa e produtos Welabs.'}};
export default function Layout({children}:{children:React.ReactNode}){return children;}
