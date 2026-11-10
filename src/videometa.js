// Leitura de dados técnicos de arquivos de vídeo (1.40): contêiner, codecs, resolução, fps, duração, taxa de bits, rotação.
// Módulo puro e assíncrono: recebe um "leitor" (offset, tamanho) => Promise<Uint8Array> e o tamanho total do arquivo,
// então lê só os trechos necessários (cabeçalho, "moov" no fim do MP4...) e nunca o vídeo inteiro. Nunca lança erro por arquivo corrompido.
// Formatos: MP4/M4V/MOV/3GP (inclui fragmentado), WebM/MKV, AVI, FLV e Ogg Theora (OGV). MPEG/TS/WMV: só informações básicas.
(function(root){
const ascii=(b,i,j)=>{let s='';for(let k=i;k<Math.min(j,b.length);k++)s+=String.fromCharCode(b[k]);return s};
const be16=(b,i)=>(b[i]<<8)|b[i+1],be32=(b,i)=>b[i]*16777216+((b[i+1]<<16)|(b[i+2]<<8)|b[i+3]),be64=(b,i)=>be32(b,i)*4294967296+be32(b,i+4);
const s32=(b,i)=>(b[i]<<24)|(b[i+1]<<16)|(b[i+2]<<8)|b[i+3];
const le16=(b,i)=>b[i]|(b[i+1]<<8),le32=(b,i)=>b[i]+b[i+1]*256+b[i+2]*65536+b[i+3]*16777216;
const utf8=b=>new TextDecoder('utf-8').decode(b);
const f32=(b,i)=>new DataView(b.buffer,b.byteOffset+i,4).getFloat32(0),f64=(b,i)=>new DataView(b.buffer,b.byteOffset+i,8).getFloat64(0);
const CODEC_V={avc1:'H.264',avc3:'H.264',hvc1:'H.265 (HEVC)',hev1:'H.265 (HEVC)',av01:'AV1',vp09:'VP9',vp08:'VP8',mp4v:'MPEG-4 Parte 2',s263:'H.263',h263:'H.263',mjpg:'Motion JPEG',jpeg:'Motion JPEG',apch:'ProRes 422 HQ',apcn:'ProRes 422',apcs:'ProRes 422 LT',apco:'ProRes 422 Proxy',ap4h:'ProRes 4444',ap4x:'ProRes 4444 XQ',dvc:'DV',dvcp:'DV',dvh5:'DVCPRO HD',vc1:'VC-1',hvc2:'H.265 (HEVC)',dvh1:'Dolby Vision (HEVC)',dvav:'Dolby Vision (H.264)'};
const CODEC_A={mp4a:'AAC',alac:'ALAC',ac_3:'AC-3',ec_3:'E-AC-3',samr:'AMR-NB',sawb:'AMR-WB',opus:'Opus',fLaC:'FLAC',sowt:'PCM',twos:'PCM',lpcm:'PCM','.mp3':'MP3',ulaw:'μ-law',alaw:'A-law'};
const AVC_PERFIL={66:'Baseline',77:'Main',88:'Extended',100:'High',110:'High 10',122:'High 4:2:2',244:'High 4:4:4 Predictive'};
const HEVC_PERFIL={1:'Main',2:'Main 10',3:'Main Still Picture',4:'Range Extensions'};
const nivelAvc=n=>n?(n%10===0?String(n/10)+'.0':(n/10).toFixed(1)):'';
const unico=(...v)=>v.find(x=>x!==undefined&&x!==null&&x!=='');
// ------------------------------- MP4 / MOV / 3GP -------------------------------
async function caixasTopo(leitor,tam){const r=[];let pos=0,n=0;
 while(pos+8<=tam&&n++<4000){const h=await leitor(pos,16);if(h.length<8)break;let t=be32(h,0),cab=8;const tipo=ascii(h,4,8);
  if(t===1){if(h.length<16)break;t=be64(h,8);cab=16}else if(t===0)t=tam-pos;
  if(t<cab)break;r.push({tipo,pos,tam:Math.min(t,tam-pos),cab});pos+=t}
 return r}
function filhos(b,ini,fim){const r=[];let p=ini;while(p+8<=fim){let t=be32(b,p),cab=8;const tipo=ascii(b,p+4,p+8);if(t===1){t=be64(b,p+8);cab=16}else if(t===0)t=fim-p;if(t<cab||p+t>fim+0)break;r.push({tipo,ini:p+cab,fim:p+t});p+=t}return r}
const achar=(b,c,t)=>filhos(b,c.ini,c.fim).find(x=>x.tipo===t);
const todos=(b,c,t)=>filhos(b,c.ini,c.fim).filter(x=>x.tipo===t);
function trakMp4(b,trak){const t={};const tkhd=achar(b,trak,'tkhd');
 if(tkhd){const v=b[tkhd.ini],o=tkhd.ini+(v===1?4+8+8+4+4+8:4+4+4+4+4+4);// versão/flags, criação, modificação, id, reservado, duração
  const m=o+8+2+2+2+2;// reservado(8), camada, grupo, volume, reservado
  const a=s32(b,m)/65536,bb=s32(b,m+4)/65536;if(a||bb){let r=Math.round(-Math.atan2(bb,a)*180/Math.PI);if(r<=-180)r+=360;t.rotacao=r/* convenção do ffprobe: graus anti-horários */}
  t.larguraExib=be32(b,m+36)/65536;t.alturaExib=be32(b,m+40)/65536}
 const mdia=achar(b,trak,'mdia');if(!mdia)return t;
 const mdhd=achar(b,mdia,'mdhd'),hdlr=achar(b,mdia,'hdlr');
 if(mdhd){const v=b[mdhd.ini];if(v===1){t.escala=be32(b,mdhd.ini+20);t.duracaoMidia=be64(b,mdhd.ini+24)}else{t.escala=be32(b,mdhd.ini+12);t.duracaoMidia=be32(b,mdhd.ini+16)}}
 if(hdlr)t.tipo=ascii(b,hdlr.ini+8,hdlr.ini+12);
 const minf=achar(b,mdia,'minf'),stbl=minf&&achar(b,minf,'stbl');if(!stbl)return t;
 const stsd=achar(b,stbl,'stsd');
 if(stsd&&be32(b,stsd.ini+4)>0){const e=stsd.ini+8,tam=be32(b,e),cod=ascii(b,e+4,e+8),fim=Math.min(e+tam,stsd.fim);t.fourcc=cod;
  if(t.tipo==='vide'){t.largura=be16(b,e+32);t.altura=be16(b,e+34);
   for(const c of filhos(b,e+86,fim)){if(c.tipo==='avcC'){const idc=b[c.ini+1],comp=b[c.ini+2];t.perfil=idc===66&&(comp&0x40)?'Constrained Baseline':(AVC_PERFIL[idc]||('perfil '+idc));t.nivel=nivelAvc(b[c.ini+3]);t.nivelNum=b[c.ini+3]}
    else if(c.tipo==='hvcC'){const p=b[c.ini+1]&31;t.perfil=HEVC_PERFIL[p]||('perfil '+p);t.nivelNum=b[c.ini+12];t.nivel=(b[c.ini+12]/30).toFixed(1).replace(/\.0$/,'.0')}
    else if(c.tipo==='av1C'){t.perfil=['Main','High','Professional'][b[c.ini+1]>>5]||'';}}}
  else if(t.tipo==='soun'){t.canais=be16(b,e+24);t.taxa=be16(b,e+32);
   const q=be16(b,e+16);const ini=e+36+(q===1?16:q===2?36:0);
   for(const c of filhos(b,ini,fim)){if(c.tipo==='esds'){const ot=achaObjetoEsds(b,c.ini+4,c.fim);if(ot===0x6B||ot===0x69)t.mp3=true;else if(ot)t.aacObj=ot}
    else if(c.tipo==='dOps'){t.canais=b[c.ini+1];t.taxa=48000}}
   if(t.fourcc==='mp4a'&&t.mp3)t.fourcc='.mp3'}}
 const stts=achar(b,stbl,'stts');if(stts){const n=be32(b,stts.ini+4);let amostras=0,delta=0;for(let i=0;i<n&&stts.ini+8+i*8+8<=stts.fim;i++){const c=be32(b,stts.ini+8+i*8),d=be32(b,stts.ini+12+i*8);amostras+=c;delta+=c*d}t.amostras=amostras;t.deltaTotal=delta}
 const stsz=achar(b,stbl,'stsz');if(stsz){const fixo=be32(b,stsz.ini+4),n=be32(b,stsz.ini+8);if(fixo){t.bytes=fixo*n;t.nAmostras=n}else{let s=0;const m=Math.min(n,Math.floor((stsz.fim-stsz.ini-12)/4));for(let i=0;i<m;i++)s+=be32(b,stsz.ini+12+i*4);t.bytes=s;t.nAmostras=m}}
 return t}
function achaObjetoEsds(b,ini,fim){let p=ini;// descritores: 0x03 ES, 0x04 DecoderConfig (objectTypeIndication)
 const tamDesc=()=>{let t=0;for(let i=0;i<4&&p<fim;i++){const x=b[p++];t=(t<<7)|(x&0x7F);if(!(x&0x80))break}return t};
 while(p<fim){const tag=b[p++];const t=tamDesc();if(tag===3){p+=3;if(b[p-1]&0x80)p+=2;continue}if(tag===4)return b[p];p+=t}return 0}
const NOME_CONT={isom:'MP4',mp41:'MP4',mp42:'MP4',avc1:'MP4',iso2:'MP4',iso4:'MP4',iso5:'MP4',iso6:'MP4',dash:'MP4 (DASH)','qt  ':'QuickTime (MOV)',M4V:'M4V','M4V ':'M4V',MSNV:'MP4',f4v:'F4V','3gp4':'3GP','3gp5':'3GP','3gp6':'3GP','3g2a':'3GP2'};
async function mp4(leitor,tam){const r={container:'MP4'};const topo=await caixasTopo(leitor,tam);
 const ft=topo.find(c=>c.tipo==='ftyp');if(ft){const b=await leitor(ft.pos,Math.min(ft.tam,64));const marca=ascii(b,8,12);r.container=NOME_CONT[marca]||(marca.startsWith('3g')?'3GP':'MP4');r.marca=marca}
 const mv=topo.find(c=>c.tipo==='moov');if(!mv||mv.tam>96*1024*1024)return r;
 const b=await leitor(mv.pos,mv.tam),moov={ini:mv.cab,fim:b.length};
 const mvhd=achar(b,moov,'mvhd');let escalaF=0,durF=0;
 if(mvhd){const v=b[mvhd.ini];let criado;if(v===1){criado=be64(b,mvhd.ini+4);escalaF=be32(b,mvhd.ini+20);durF=be64(b,mvhd.ini+24)}else{criado=be32(b,mvhd.ini+4);escalaF=be32(b,mvhd.ini+12);durF=be32(b,mvhd.ini+16)}
  if(criado>0)r.criado=new Date((criado-2082844800)*1000).toISOString().replace('.000Z','Z')}
 if(!durF){const mvex=achar(b,moov,'mvex'),mehd=mvex&&achar(b,mvex,'mehd');if(mehd){const v=b[mehd.ini];durF=v===1?be64(b,mehd.ini+4):be32(b,mehd.ini+4)}}
 const faixas=todos(b,moov,'trak').map(t=>trakMp4(b,t));
 const v=faixas.find(t=>t.tipo==='vide'),a=faixas.find(t=>t.tipo==='soun');
 let dur=escalaF?durF/escalaF:0;
 if(!dur){const d=Math.max(0,...faixas.map(t=>t.escala?t.duracaoMidia/t.escala:0));dur=d}
 if(!dur){// fragmentado sem mehd: soma as durações dos fragmentos seria custoso; usa a menor estimativa pelo tamanho
  dur=0}
 r.duracao=dur;
 const bits=(t)=>t&&t.bytes&&dur?Math.round(t.bytes*8/dur):0;
 if(v)r.video={codec:CODEC_V[v.fourcc]||v.fourcc,fourcc:v.fourcc,perfil:v.perfil||'',nivel:v.nivel||'',nivelNum:v.nivelNum,largura:v.largura,altura:v.altura,
  fps:v.amostras&&v.deltaTotal?v.escala*v.amostras/v.deltaTotal:0,bitrate:bits(v),rotacao:v.rotacao||0};
 if(a)r.audio={codec:CODEC_A[a.fourcc]||a.fourcc,fourcc:a.fourcc,canais:a.canais,taxa:a.taxa,bitrate:bits(a)};
 // título (©nam) em udta/meta/ilst
 const udta=achar(b,moov,'udta'),meta=udta&&achar(b,udta,'meta');
 if(meta){const ilst=achar(b,{ini:meta.ini+4,fim:meta.fim},'ilst');if(ilst)for(const c of filhos(b,ilst.ini,ilst.fim)){if(c.tipo==='\u00A9nam'){const d=achar(b,c,'data');if(d)r.titulo=utf8(b.subarray(d.ini+8,d.fim))}}}
 return r}
// ------------------------------- WebM / Matroska -------------------------------
function vint(b,p,mascara){const x=b[p];if(x===undefined)return null;let n=1,m=0x80;while(n<=8&&!(x&m)){n++;m>>=1}if(n>8||p+n>b.length)return null;let v=mascara?x&(m-1):x;for(let i=1;i<n;i++)v=v*256+b[p+i];
 const desc=mascara&&v===Math.pow(2,7*n)-1;return{v:desc?-1:v,n}}
const num=(b,i,j)=>{let v=0;for(let k=i;k<j;k++)v=v*256+b[k];return v};
const MKV_V={'V_MPEG4/ISO/AVC':'H.264','V_MPEGH/ISO/HEVC':'H.265 (HEVC)','V_VP8':'VP8','V_VP9':'VP9','V_AV1':'AV1','V_THEORA':'Theora','V_MPEG4/ISO/SP':'MPEG-4 Parte 2','V_MPEG4/ISO/ASP':'MPEG-4 Parte 2','V_MPEG2':'MPEG-2','V_MPEG1':'MPEG-1','V_MS/VFW/FOURCC':'VFW (VC-1/outros)','V_PRORES':'ProRes'};
const MKV_A={'A_AAC':'AAC','A_OPUS':'Opus','A_VORBIS':'Vorbis','A_FLAC':'FLAC','A_AC3':'AC-3','A_EAC3':'E-AC-3','A_DTS':'DTS','A_MPEG/L3':'MP3','A_MPEG/L2':'MP2','A_TRUEHD':'TrueHD'};
const MKV_NOMES={0x1A45DFA3:'ebml',0x18538067:'segmento',0x1549A966:'info',0x1654AE6B:'faixas',0x1F43B675:'cluster'};
function mkvLista(b,ini,fim,fn){let p=ini;while(p<fim){const id=vint(b,p,false);if(!id)break;const tm=vint(b,p+id.n,true);if(!tm)break;const dado=p+id.n+tm.n,f=tm.v<0?fim:Math.min(fim,dado+tm.v);fn(id.v,dado,f,tm.v<0);p=f;if(tm.v<0&&id.v!==0x18538067)break}}
async function mkv(leitor,tam){const b=await leitor(0,Math.min(tam,4*1024*1024)),r={container:'Matroska (MKV)'};let escala=1000000,durRaw=0;const trilhas=[];
 const ler=(ini,fim)=>mkvLista(b,ini,fim,(id,d,f)=>{
  if(id===0x4282)r.docType=ascii(b,d,f);
  else if(id===0x1A45DFA3)ler(d,f);
  else if(id===0x18538067)ler(d,f);
  else if(id===0x1549A966)mkvLista(b,d,f,(i,x,y)=>{if(i===0x2AD7B1)escala=num(b,x,y);else if(i===0x4489)durRaw=y-x===4?f32(b,x):f64(b,x);else if(i===0x7BA9)r.titulo=utf8(b.subarray(x,y));else if(i===0x4461&&y-x===8){const ns=s32(b,x)*4294967296+le32(b,x+4)*0;}});
  else if(id===0x1654AE6B)mkvLista(b,d,f,(i,x,y)=>{if(i!==0xAE)return;const t={};mkvLista(b,x,y,(k,p,q)=>{
    if(k===0xD7)t.num=num(b,p,q);else if(k===0x83)t.tipo=num(b,p,q);else if(k===0x86)t.codec=ascii(b,p,q);else if(k===0x23E383)t.defDur=num(b,p,q);
    else if(k===0xE0)mkvLista(b,p,q,(m,u,w)=>{if(m===0xB0)t.largura=num(b,u,w);else if(m===0xBA)t.altura=num(b,u,w);else if(m===0x54B0)t.larguraExib=num(b,u,w);else if(m===0x54BA)t.alturaExib=num(b,u,w)});
    else if(k===0xE1)mkvLista(b,p,q,(m,u,w)=>{if(m===0xB5)t.taxa=Math.round(w-u===4?f32(b,u):f64(b,u));else if(m===0x9F)t.canais=num(b,u,w);else if(m===0x6264)t.bits=num(b,u,w)});
    else if(k===0x63A2)t.priv=b.subarray(p,q)});trilhas.push(t)});
  else if(id===0x1F43B675)return});
 ler(0,b.length);
 r.container=r.docType==='webm'?'WebM':'Matroska (MKV)';r.duracao=durRaw?durRaw*escala/1e9:0;
 const v=trilhas.find(t=>t.tipo===1),a=trilhas.find(t=>t.tipo===2);
 if(v){let perfil='';if(v.codec==='V_MPEG4/ISO/AVC'&&v.priv&&v.priv.length>3){const idc=v.priv[1];perfil=idc===66&&(v.priv[2]&0x40)?'Constrained Baseline':(AVC_PERFIL[idc]||'');v.nivelNum=v.priv[3];v.nivel=nivelAvc(v.priv[3])}
  r.video={codec:MKV_V[v.codec]||v.codec||'',fourcc:v.codec,perfil,nivel:v.nivel||'',nivelNum:v.nivelNum,largura:v.largura,altura:v.altura,fps:v.defDur?1e9/v.defDur:0,bitrate:0,rotacao:0}}
 if(a)r.audio={codec:MKV_A[a.codec]||a.codec||'',fourcc:a.codec,canais:a.canais,taxa:a.taxa,bitrate:0};
 return r}
// ------------------------------- AVI -------------------------------
const AVI_V={H264:'H.264',h264:'H.264',avc1:'H.264',X264:'H.264',x264:'H.264',XVID:'MPEG-4 Parte 2',xvid:'MPEG-4 Parte 2',DIVX:'MPEG-4 Parte 2',divx:'MPEG-4 Parte 2',DX50:'MPEG-4 Parte 2',FMP4:'MPEG-4 Parte 2',MP4V:'MPEG-4 Parte 2',mp4v:'MPEG-4 Parte 2',MJPG:'Motion JPEG',mjpg:'Motion JPEG',WMV1:'WMV 7',WMV2:'WMV 8',WMV3:'WMV 9',DIV3:'MS MPEG-4 v3',MP42:'MS MPEG-4 v2',MP43:'MS MPEG-4 v3',HEVC:'H.265 (HEVC)',H265:'H.265 (HEVC)',VP80:'VP8',VP90:'VP9',DVSD:'DV',dvsd:'DV',I420:'YUV 4:2:0 (sem compressão)',YUY2:'YUV 4:2:2 (sem compressão)'};
const AVI_A={1:'PCM',2:'ADPCM',3:'PCM (float)',6:'A-law',7:'μ-law',0x50:'MP2',0x55:'MP3',0x160:'WMA 1',0x161:'WMA 2',0x162:'WMA Pro',0xFF:'AAC',0x2000:'AC-3',0x2001:'DTS',0x674F:'Vorbis',0xFFFE:'PCM (extensível)',0x1:'PCM'};
async function avi(leitor,tam){const b=await leitor(0,Math.min(tam,256*1024)),r={container:'AVI'};let us=0,total=0,avW=0,avH=0;const fx=[];
 const lista=(ini,fim)=>{let p=ini;while(p+8<=fim){const id=ascii(b,p,p+4),t=le32(b,p+4),d=p+8,f=Math.min(fim,d+t);
  if(id==='LIST'||id==='RIFF'){const tipo=ascii(b,d,d+4);if(tipo==='hdrl'||tipo==='strl'||tipo==='AVI ')lista(d+4,f);else if(tipo==='movi')return}
  else if(id==='avih'){us=le32(b,d);total=le32(b,d+16);avW=le32(b,d+32);avH=le32(b,d+36)}
  else if(id==='strh'){fx.push({tipo:ascii(b,d,d+4),handler:ascii(b,d+4,d+8),escala:le32(b,d+20),taxa:le32(b,d+24),comp:le32(b,d+32)})}
  else if(id==='strf'&&fx.length){const s=fx[fx.length-1];if(s.tipo==='vids'){s.largura=le32(b,d+4);s.altura=le32(b,d+8)|0;s.compressao=ascii(b,d+16,d+20);s.bits=le16(b,d+14)}else if(s.tipo==='auds'){s.tag=le16(b,d);s.canais=le16(b,d+2);s.taxaA=le32(b,d+4);s.bytesSeg=le32(b,d+8)}}
  p=d+t+(t&1)}};
 lista(0,b.length);
 const v=fx.find(s=>s.tipo==='vids'),a=fx.find(s=>s.tipo==='auds');
 if(v){const fps=v.escala&&v.taxa?v.taxa/v.escala:(us?1e6/us:0);r.duracao=v.escala&&v.taxa?v.comp*v.escala/v.taxa:(us?total*us/1e6:0);
  const fc=v.compressao&&v.compressao.trim()?v.compressao:v.handler;
  r.video={codec:AVI_V[fc]||AVI_V[v.handler]||fc||'',fourcc:fc,perfil:'',nivel:'',largura:v.largura||avW,altura:Math.abs(v.altura)||avH,fps,bitrate:0,rotacao:0}}
 if(a){if(!r.duracao&&a.escala&&a.taxa)r.duracao=a.comp*a.escala/a.taxa;r.audio={codec:AVI_A[a.tag]||('0x'+a.tag.toString(16)),fourcc:String(a.tag),canais:a.canais,taxa:a.taxaA,bitrate:a.bytesSeg*8}}
 return r}
// ------------------------------- FLV (AMF0 do onMetaData) -------------------------------
const FLV_V={2:'Sorenson H.263',3:'Screen Video',4:'VP6',5:'VP6 (alfa)',7:'H.264',12:'H.265 (HEVC)'};
const FLV_A={0:'PCM',1:'ADPCM',2:'MP3',4:'Nellymoser 16k',5:'Nellymoser 8k',6:'Nellymoser',7:'A-law',8:'μ-law',10:'AAC',11:'Speex',14:'MP3 8k'};
function amf(b,p,tipo){if(tipo===undefined)tipo=b[p++];switch(tipo){case 0:return[f64(b,p),p+8];case 1:return[!!b[p],p+1];case 2:{const n=be16(b,p);return[utf8(b.subarray(p+2,p+2+n)),p+2+n]}
 case 3:case 8:{const o={};if(tipo===8)p+=4;for(;;){if(p+3>b.length)return[o,p];const n=be16(b,p);if(n===0&&b[p+2]===9)return[o,p+3];const k=utf8(b.subarray(p+2,p+2+n));p+=2+n;const[v,q]=amf(b,p);o[k]=v;p=q}}
 case 10:{const n=be32(b,p);p+=4;const a=[];for(let i=0;i<n&&p<b.length;i++){const[v,q]=amf(b,p);a.push(v);p=q}return[a,p]}default:return[null,b.length]}}
async function flv(leitor,tam){const b=await leitor(0,Math.min(tam,256*1024)),r={container:'FLV'};const fl=b[4];let p=be32(b,5)+4;
 while(p+11<=b.length){const t=b[p],ds=(b[p+1]<<16)|(b[p+2]<<8)|b[p+3];if(t===18){const[nome,q]=amf(b,p+11);if(nome==='onMetaData'){const[m]=amf(b,q);
   r.duracao=+m.duration||0;const vc=m.videocodecid,ac=m.audiocodecid;
   if(fl&1||m.width)r.video={codec:typeof vc==='number'?(FLV_V[vc]||('id '+vc)):(vc||''),fourcc:String(vc),perfil:'',nivel:'',largura:m.width|0,altura:m.height|0,fps:+m.framerate||0,bitrate:Math.round((+m.videodatarate||0)*1000),rotacao:0};
   if(fl&4||m.audiosamplerate)r.audio={codec:typeof ac==='number'?(FLV_A[ac]||('id '+ac)):(ac||''),fourcc:String(ac),canais:m.audiochannels|0||(m.stereo?2:1),taxa:m.audiosamplerate|0,bitrate:Math.round((+m.audiodatarate||0)*1000)};
   return r}}
  p+=11+ds+4}
 return r}
// ------------------------------- Ogg Theora -------------------------------
async function ogv(leitor,tam){const b=await leitor(0,Math.min(tam,64*1024)),r={container:'Ogg Vídeo'};
 const i=(()=>{for(let k=0;k<b.length-42;k++)if(b[k]===0x80&&ascii(b,k+1,k+7)==='theora')return k;return-1})();
 if(i>=0){const w=(b[i+14]<<16)|(b[i+15]<<8)|b[i+16],h=(b[i+17]<<16)|(b[i+18]<<8)|b[i+19],frn=be32(b,i+22),frd=be32(b,i+26),shift=((b[i+40]&3)<<3)|(b[i+41]>>5);
  r.video={codec:'Theora',fourcc:'theora',perfil:'',nivel:'',largura:w,altura:h,fps:frd?frn/frd:0,bitrate:(be32(b,i+37)>>8)||0,rotacao:0};
  const k=(()=>{for(let q=0;q<b.length-30;q++)if(b[q]===1&&ascii(b,q+1,q+7)==='vorbis')return q;return-1})();
  if(k>=0)r.audio={codec:'Vorbis',fourcc:'vorbis',canais:b[k+11],taxa:le32(b,k+12),bitrate:le32(b,k+20)};
  const fim=await leitor(Math.max(0,tam-65536),Math.min(tam,65536));let g=-1;
  for(let q=fim.length-27;q>=0;q--){if(ascii(fim,q,q+4)==='OggS'){const ser=le32(fim,q+14);// só páginas do fluxo Theora (granule em lógica de vídeo)
    const gr=le32(fim,q+6)+le32(fim,q+10)*4294967296;const ns=fim[q+26];let corpo=q+27+ns,tm=0;for(let s=0;s<ns;s++)tm+=fim[q+27+s];
    const ehTheora=gr>0&&(gr%1===0);if(ehTheora&&ser===serTheora(b,i)){g=gr;break}}}
  if(g>0&&frn){const mascara=Math.pow(2,shift)-1,quadros=Math.floor(g/Math.pow(2,shift))+(g%Math.pow(2,shift))+0;r.duracao=quadros*frd/frn}}
 return r}
function serTheora(b,i){// número de série do fluxo Theora = o da página que contém o cabeçalho
 for(let q=i-1;q>=0;q--)if(ascii(b,q,q+4)==='OggS')return le32(b,q+14);return-1}
// ------------------------------- API -------------------------------
const FORMATOS={mp4,mov:mp4,'3gp':mp4,m4v:mp4,webm:mkv,mkv,avi,flv,ogv};
async function lerVideo(leitor,tam,formatoId){const r={container:'',duracao:0,video:null,audio:null,titulo:'',criado:'',bitrate:tam&&0};
 try{const fn=FORMATOS[formatoId];if(fn){const x=await fn(leitor,tam);Object.assign(r,x)}}catch(e){r.erro=String(e&&e.message||e)}
 if(r.duracao&&tam)r.bitrate=Math.round(tam*8/r.duracao);
 if(r.video&&!r.video.bitrate&&r.bitrate&&!r.audio)r.video.bitrate=r.bitrate;
 return r}
function formatarTaxa(bps){if(!bps)return'';return bps>=1e6?(bps/1e6).toFixed(2).replace('.',',')+' Mbps':Math.round(bps/1000)+' kbps'}
function formatarFps(f){if(!f)return'';return(Math.abs(f-Math.round(f))<0.005?String(Math.round(f)):f.toFixed(3).replace(/0+$/,'').replace('.',','))+' fps'}
const api={lerVideo,formatarTaxa,formatarFps};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.UDSVideoMeta=api;
})(typeof window!=='undefined'?window:globalThis);
