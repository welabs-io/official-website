import {NextResponse,type NextRequest} from 'next/server';
// RETIRADA DE PACOTES LEGADOS
// Legacy packs that cite a client agency or an internal codename are not served over HTTP;
// product pages still read their manifest from disk on the server.
const retired=/^\/(presentations\/(malupe|autoinfracao)\/|presentation-downloads\/(malupe|autoinfracao)-|apresentacoes\/(malupe|autoinfracao)(\/|$))/;
export function proxy(request:NextRequest){
 if(retired.test(request.nextUrl.pathname))return new NextResponse(null,{status:404});
 const headers=new Headers(request.headers);headers.set('x-portfolio-language',request.nextUrl.searchParams.get('lang')==='en'?'en':'pt');return NextResponse.next({request:{headers}});
}
export const config={matcher:['/','/sobre','/servicos','/portfolio/:path*','/welabs/:path*','/apresentacoes/:path*','/portfolio-preview/:path*','/presentations/malupe/:path*','/presentations/autoinfracao/:path*','/presentation-downloads/:path*']};
