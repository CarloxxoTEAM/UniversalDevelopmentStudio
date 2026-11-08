// Leitura de etiquetas (título, artista, capa...) e dados técnicos de arquivos de áudio (1.30).
// Módulo puro: recebe os bytes do arquivo (Uint8Array) e devolve um objeto. Nunca lança erro por arquivo corrompido.
// Formatos: MP3 (ID3v2.2/2.3/2.4, ID3v1, Xing), WAV (fmt, LIST INFO), FLAC, OGG Vorbis, Opus e M4A (AAC/ALAC).
(function(root){
const ascii=(b,i,j)=>{let s='';for(let k=i;k<Math.min(j,b.length);k++)s+=String.fromCharCode(b[k]);return s};
const A=(b,i,s)=>b.length>=i+s.length&&ascii(b,i,i+s.length)===s;
const be16=(b,i)=>(b[i]<<8)|b[i+1],be32=(b,i)=>b[i]*16777216+((b[i+1]<<16)|(b[i+2]<<8)|b[i+3]);
const le16=(b,i)=>b[i]|(b[i+1]<<8),le32=(b,i)=>b[i]+b[i+1]*256+b[i+2]*65536+b[i+3]*16777216,le64=(b,i)=>le32(b,i)+le32(b,i+4)*4294967296;
const sync=(b,i)=>((b[i]&0x7F)<<21)|((b[i+1]&0x7F)<<14)|((b[i+2]&0x7F)<<7)|(b[i+3]&0x7F);
const TD={};const td=n=>TD[n]||(TD[n]=new TextDecoder(n));
const utf8=b=>td('utf-8').decode(b);
const limpa=s=>s.replace(/\uFEFF/g,'').replace(/\u0000+$/,'').split('\u0000').filter(x=>x!=='').join(' / ').trim();
function texto(enc,b){if(!b.length)return '';let s;
 if(enc===1){let le=true,i=0;if(b[0]===0xFE&&b[1]===0xFF){le=false;i=2}else if(b[0]===0xFF&&b[1]===0xFE)i=2;s=td(le?'utf-16le':'utf-16be').decode(b.subarray(i))}
 else if(enc===2)s=td('utf-16be').decode(b);else if(enc===3)s=utf8(b);else s=td('iso-8859-1').decode(b);
 return limpa(s)}
// separa em [antes, depois] no primeiro terminador nulo (1 byte, ou 2 alinhados em UTF-16)
function corta(enc,b){const dois=enc===1||enc===2;for(let i=0;i<b.length;i+=dois?2:1){if(b[i]===0&&(!dois||b[i+1]===0))return[b.subarray(0,i),b.subarray(i+(dois?2:1))]}return[b,new Uint8Array(0)]}
const GEN='Blues,Classic Rock,Country,Dance,Disco,Funk,Grunge,Hip-Hop,Jazz,Metal,New Age,Oldies,Other,Pop,R&B,Rap,Reggae,Rock,Techno,Industrial,Alternative,Ska,Death Metal,Pranks,Soundtrack,Euro-Techno,Ambient,Trip-Hop,Vocal,Jazz+Funk,Fusion,Trance,Classical,Instrumental,Acid,House,Game,Sound Clip,Gospel,Noise,AlternRock,Bass,Soul,Punk,Space,Meditative,Instrumental Pop,Instrumental Rock,Ethnic,Gothic,Darkwave,Techno-Industrial,Electronic,Pop-Folk,Eurodance,Dream,Southern Rock,Comedy,Cult,Gangsta,Top 40,Christian Rap,Pop/Funk,Jungle,Native American,Cabaret,New Wave,Psychadelic,Rave,Showtunes,Trailer,Lo-Fi,Tribal,Acid Punk,Acid Jazz,Polka,Retro,Musical,Rock & Roll,Hard Rock'.split(',');
function genero(s){if(!s)return s;let m=s.match(/^\((\d+)\)(.*)$/);if(m)return m[2].trim()||GEN[+m[1]]||m[2]||s;if(/^\d+$/.test(s))return GEN[+s]||s;return s}
function desincroniza(b){const o=[];for(let i=0;i<b.length;i++){o.push(b[i]);if(b[i]===0xFF&&b[i+1]===0)i++}return Uint8Array.from(o)}
const F23={TIT2:'titulo',TPE1:'artista',TPE2:'artistaAlbum',TALB:'album',TYER:'ano',TDRC:'ano',TRCK:'faixa',TPOS:'disco',TCON:'genero'};
const F22={TT2:'titulo',TP1:'artista',TP2:'artistaAlbum',TAL:'album',TYE:'ano',TRK:'faixa',TPA:'disco',TCO:'genero'};
// ---------------- ID3 ----------------
function id3v2(b){if(!A(b,0,'ID3')||b.length<10)return null;const ver=b[3],fl=b[5];if(ver<2||ver>4)return null;const tam=sync(b,6),fim=Math.min(b.length,10+tam),campos={};let capa=null,pos=10;
 if(fl&0x40&&ver>2){const es=ver===4?sync(b,pos):be32(b,pos)+4;pos+=es}
 const cab=ver===2?6:10,idl=ver===2?3:4;
 while(pos+cab<=fim){const id=ascii(b,pos,pos+idl);if(!/^[A-Z0-9]+$/.test(id))break;
  const t=ver===2?(b[pos+3]<<16)|(b[pos+4]<<8)|b[pos+5]:ver===4?sync(b,pos+4):be32(b,pos+4);if(t<=0||pos+cab+t>fim)break;
  const flf=ver>2?be16(b,pos+8):0;let d=b.subarray(pos+cab,pos+cab+t);pos+=cab+t;
  if(ver===4){if(flf&1)d=d.subarray(4);if(flf&2||fl&0x80)d=desincroniza(d)}else if(fl&0x80)d=desincroniza(d);
  if(!d.length)continue;const enc=d[0],tabela=ver===2?F22:F23;
  if(tabela[id]){const v=texto(enc,d.subarray(1));if(v&&!campos[tabela[id]])campos[tabela[id]]=v}
  else if(id==='COMM'||id==='COM'){const [,resto]=corta(enc,d.subarray(4));const v=texto(enc,resto)||texto(enc,d.subarray(4));if(v&&!campos.comentario)campos.comentario=v}
  else if(id==='APIC'||id==='PIC'){let i=1,mime;if(id==='PIC'){mime={PNG:'image/png',JPG:'image/jpeg'}[ascii(d,1,4)]||'image/jpeg';i=4}else{const [m,r]=corta(0,d.subarray(1));mime=ascii(m,0,m.length)||'image/jpeg';i=d.length-r.length}
   const tipo=d[i];const [,dados]=corta(enc,d.subarray(i+1));if(dados.length&&(!capa||tipo===3))capa={mime:mime==='image/jpg'?'image/jpeg':mime,dados:dados.slice()}}}
 if(campos.genero)campos.genero=genero(campos.genero);
 return{campos,capa,fim:10+tam+(fl&0x10?10:0)}}
function id3v1(b){const n=b.length;if(n<128||!A(b,n-128,'TAG'))return null;
 const f=(i,j)=>{const x=b.subarray(n-128+i,n-128+j);let k=x.length;while(k>0&&(x[k-1]===0||x[k-1]===32))k--;const y=x.subarray(0,k);let s;try{s=new TextDecoder('utf-8',{fatal:true}).decode(y)}catch(e){s=td('iso-8859-1').decode(y)}return s.replace(/\u0000.*$/,'')};
 const r={titulo:f(3,33),artista:f(33,63),album:f(63,93),ano:f(93,97),comentario:f(97,125)};if(b[n-3]===0&&b[n-2]!==0)r.faixa=String(b[n-2]);const g=b[n-1];if(g<GEN.length)r.genero=GEN[g];
 for(const k of Object.keys(r))if(!r[k])delete r[k];return r}
// ---------------- MP3 ----------------
const V1={1:[0,32,64,96,128,160,192,224,256,288,320,352,384,416,448],2:[0,32,48,56,64,80,96,112,128,160,192,224,256,320,384],3:[0,32,40,48,56,64,80,96,112,128,160,192,224,256,320]};
const V2={1:[0,32,48,56,64,80,96,112,128,144,160,176,192,224,256],2:[0,8,16,24,32,40,48,56,64,80,96,112,128,144,160],3:[0,8,16,24,32,40,48,56,64,80,96,112,128,144,160]};
const SR={1:[44100,48000,32000],2:[22050,24000,16000],2.5:[11025,12000,8000]};
function quadro(b,i){if(i+4>b.length||b[i]!==0xFF||(b[i+1]&0xE0)!==0xE0)return null;
 const vb=(b[i+1]>>3)&3,cb=(b[i+1]>>1)&3,bi=b[i+2]>>4,si=(b[i+2]>>2)&3;if(vb===1||cb===0||bi===0||bi===15||si===3)return null;
 const versao=vb===3?1:vb===2?2:2.5,camada=4-cb,br=(versao===1?V1:V2)[camada][bi],sr=SR[versao][si],pad=(b[i+2]>>1)&1,canais=(b[i+3]>>6)===3?1:2;
 const len=camada===1?((12*br*1000/sr|0)+pad)*4:camada===3&&versao!==1?(72*br*1000/sr|0)+pad:(144*br*1000/sr|0)+pad;
 return{versao,camada,br,sr,canais,len,crc:!(b[i+1]&1),spf:camada===1?384:camada===2||versao===1?1152:576}}
function achaQuadro(b,ini,fim){for(let i=ini;i<Math.min(fim-4,ini+16384);i++){const q=quadro(b,i);if(q){const n=i+q.len;if(n+4>=fim||quadro(b,n))return{...q,pos:i}}}return null}
function mp3(b){const r={formato:'MP3',capa:null,tecnico:{}};let ini=0;const v2=id3v2(b);if(v2){Object.assign(r,v2.campos);r.capa=v2.capa;ini=v2.fim}
 const v1=id3v1(b),fimAudio=b.length-(v1?128:0);if(v1)for(const k of Object.keys(v1))if(!r[k])r[k]=v1[k];
 const q=achaQuadro(b,ini,fimAudio);if(!q)return r;
 const lado=q.versao===1?(q.canais===1?17:32):(q.canais===1?9:17),xp=q.pos+4+(q.crc?2:0)+lado,xing=A(b,xp,'Xing')||A(b,xp,'Info');
 let dur,br=q.br,vbr=false;
 if(xing&&(be32(b,xp+4)&1)){const quadros=be32(b,xp+8);dur=quadros*q.spf/q.sr;vbr=A(b,xp,'Xing');if(vbr&&be32(b,xp+4)&2)br=Math.round(be32(b,xp+12)*8/dur/1000)}
 else if(A(b,q.pos+36,'VBRI')){const quadros=be32(b,q.pos+14);dur=quadros*q.spf/q.sr;vbr=true;br=Math.round(be32(b,q.pos+10)*8/dur/1000)}
 else dur=(fimAudio-q.pos)*8/(q.br*1000);
 r.tecnico={codec:`MPEG-${q.versao} Camada ${'I'.repeat(q.camada).replace('III','III')}`.replace('IIII','III'),canais:q.canais,taxa:q.sr,bitrate:br,duracao:dur,vbr};return r}
// ---------------- WAV ----------------
const WTAG={1:'PCM',3:'PCM float',2:'ADPCM',6:'A-law',7:'µ-law',0x11:'IMA ADPCM',0x55:'MP3'};
const INFO={INAM:'titulo',IART:'artista',IPRD:'album',ICRD:'ano',IGNR:'genero',ICMT:'comentario',ITRK:'faixa',IPRT:'faixa'};
function wav(b){const r={formato:'WAV',capa:null,tecnico:{}};let pos=12,dataTam=null,fmt=null;
 while(pos+8<=b.length){const id=ascii(b,pos,pos+4);let t=le32(b,pos+4);const d=pos+8;
  if(id==='data'){dataTam=Math.min(t,b.length-d);if(t===0xFFFFFFFF||t===0)dataTam=b.length-d}
  else if(id==='fmt '&&t>=16){let tag=le16(b,d);if(tag===0xFFFE&&t>=26)tag=le16(b,d+24);fmt={tag,canais:le16(b,d+2),taxa:le32(b,d+4),byteRate:le32(b,d+8),bits:le16(b,d+14)}}
  else if(id==='LIST'&&A(b,d,'INFO')){let p=d+4;const fimL=Math.min(d+t,b.length);while(p+8<=fimL){const k=ascii(b,p,p+4),n=le32(b,p+4),v=texto(3,b.subarray(p+8,Math.min(p+8+n,fimL)));if(INFO[k]&&v&&!r[INFO[k]])r[INFO[k]]=INFO[k]==='ano'?v.slice(0,4):v;p+=8+n+(n&1)}}
  else if(id==='id3 '){const v2=id3v2(b.subarray(d,d+t));if(v2){for(const k of Object.keys(v2.campos))if(!r[k])r[k]=v2.campos[k];if(!r.capa)r.capa=v2.capa}}
  pos=d+t+(t&1);if(t>b.length)break}
 if(fmt){const nome=WTAG[fmt.tag]||'Formato 0x'+fmt.tag.toString(16);r.tecnico={codec:fmt.tag===1||fmt.tag===3?`${nome} ${fmt.bits} bits`:nome,canais:fmt.canais,taxa:fmt.taxa,bits:fmt.bits,bitrate:Math.round(fmt.byteRate*8/1000),duracao:fmt.byteRate&&dataTam!=null?dataTam/fmt.byteRate:undefined}}
 return r}
// ---------------- Vorbis comment (FLAC, Ogg, Opus) ----------------
const VC={TITLE:'titulo',ARTIST:'artista',ALBUMARTIST:'artistaAlbum',ALBUM:'album',DATE:'ano',YEAR:'ano',TRACKNUMBER:'faixa',DISCNUMBER:'disco',GENRE:'genero',COMMENT:'comentario',DESCRIPTION:'comentario'};
function imagemFlac(d){let p=4;const ml=be32(d,p);p+=4;const mime=ascii(d,p,p+ml);p+=ml;const dl=be32(d,p);p+=4+dl+16;const n=be32(d,p);p+=4;return{mime:mime||'image/jpeg',dados:d.slice(p,p+n)}}
function vorbisComment(d,r){let p=0;const vl=le32(d,p);p+=4+vl;const n=le32(d,p);p+=4;for(let i=0;i<n&&p+4<=d.length;i++){const l=le32(d,p);p+=4;const s=utf8(d.subarray(p,p+l));p+=l;const k=s.indexOf('=');if(k<1)continue;const nome=s.slice(0,k).toUpperCase(),v=s.slice(k+1).trim();
  if(nome==='METADATA_BLOCK_PICTURE'){try{const bin=Uint8Array.from(atob(v),c=>c.charCodeAt(0));if(!r.capa)r.capa=imagemFlac(bin)}catch(e){}}
  else if(VC[nome]&&v&&!r[VC[nome]])r[VC[nome]]=v}}
// ---------------- FLAC ----------------
function flac(b){const r={formato:'FLAC',capa:null,tecnico:{}};let pos=4,ultimo=false;
 while(!ultimo&&pos+4<=b.length){const h=b[pos];ultimo=!!(h&0x80);const tipo=h&0x7F,t=(b[pos+1]<<16)|(b[pos+2]<<8)|b[pos+3],d=b.subarray(pos+4,pos+4+t);pos+=4+t;
  if(tipo===0&&d.length>=18){const taxa=(d[10]<<12)|(d[11]<<4)|(d[12]>>4),canais=((d[12]>>1)&7)+1,bits=(((d[12]&1)<<4)|(d[13]>>4))+1,total=(d[13]&15)*4294967296+be32(d,14);r.tecnico={codec:'FLAC',canais,taxa,bits,duracao:total/taxa}}
  else if(tipo===4)vorbisComment(d,r);else if(tipo===6&&!r.capa){try{r.capa=imagemFlac(d)}catch(e){}}}
 if(r.tecnico.duracao)r.tecnico.bitrate=Math.round(b.length*8/r.tecnico.duracao/1000);return r}
// ---------------- Ogg (Vorbis e Opus) ----------------
function ogg(b){const r={formato:'OGG',capa:null,tecnico:{}};const pacotes=[];let atual=[],pos=0,vistos=0;
 while(pacotes.length<2&&pos+27<=b.length&&A(b,pos,'OggS')&&vistos++<4000){const n=b[pos+26];let p=pos+27+n,q=pos+27;
  for(let i=0;i<n;i++){const len=b[q+i];atual.push(b.subarray(p,p+len));p+=len;if(len<255){let tot=0;for(const x of atual)tot+=x.length;const o=new Uint8Array(tot);let k=0;for(const x of atual){o.set(x,k);k+=x.length}pacotes.push(o);atual=[]}}pos=p}
 const [id,com]=pacotes;if(!id)return r;let sr=0,pre=0,codec;
 if(A(id,1,'vorbis')){codec='Vorbis';r.formato='OGG Vorbis';sr=le32(id,12);r.tecnico={codec,canais:id[11],taxa:sr,bitrate:Math.round(le32(id,20)/1000)||undefined};if(com&&A(com,1,'vorbis'))vorbisComment(com.subarray(7),r)}
 else if(A(id,0,'OpusHead')){codec='Opus';r.formato='Opus';pre=le16(id,10);sr=48000;r.tecnico={codec,canais:id[9],taxa:le32(id,12)||48000};if(com&&A(com,0,'OpusTags'))vorbisComment(com.subarray(8),r)}
 else return r;
 for(let i=b.length-4;i>=Math.max(0,b.length-70000);i--){if(A(b,i,'OggS')){const g=le64(b,i+6);if(g>0&&g<1e15){r.tecnico.duracao=Math.max(0,g-pre)/sr}break}}
 if(r.tecnico.duracao&&!r.tecnico.bitrate)r.tecnico.bitrate=Math.round(b.length*8/r.tecnico.duracao/1000);return r}
// ---------------- M4A (MP4) ----------------
function caixas(b,ini,fim){const o=[];let p=ini;while(p+8<=fim){let t=be32(b,p);const tipo=ascii(b,p+4,p+8);let h=8;if(t===1){t=be32(b,p+8)*4294967296+be32(b,p+12);h=16}else if(t===0)t=fim-p;if(t<h||p+t>fim+1)break;o.push({tipo,ini:p+h,fim:Math.min(p+t,fim)});p+=t}return o}
const filho=(b,c,tipo)=>caixas(b,c.ini,c.fim).find(x=>x.tipo===tipo);
const MI={'\u00a9nam':'titulo','\u00a9ART':'artista','aART':'artistaAlbum','\u00a9alb':'album','\u00a9day':'ano','\u00a9gen':'genero','\u00a9cmt':'comentario','\u00a9trk':'faixa'};
function m4a(b){const r={formato:'M4A',capa:null,tecnico:{}};const moov=caixas(b,0,b.length).find(c=>c.tipo==='moov');if(!moov)return r;
 const mvhd=filho(b,moov,'mvhd');let dur;if(mvhd){const v=b[mvhd.ini];const ts=v===1?be32(b,mvhd.ini+20):be32(b,mvhd.ini+12),d=v===1?be32(b,mvhd.ini+24)*4294967296+be32(b,mvhd.ini+28):be32(b,mvhd.ini+16);if(ts)dur=d/ts}
 for(const trak of caixas(b,moov.ini,moov.fim).filter(c=>c.tipo==='trak')){const mdia=filho(b,trak,'mdia'),hdlr=mdia&&filho(b,mdia,'hdlr');if(!hdlr||ascii(b,hdlr.ini+8,hdlr.ini+12)!=='soun')continue;
  const minf=filho(b,mdia,'minf'),stbl=minf&&filho(b,minf,'stbl'),stsd=stbl&&filho(b,stbl,'stsd');if(!stsd)continue;const e=stsd.ini+8,tipo=ascii(b,e+4,e+8);
  r.tecnico={codec:tipo==='alac'?'ALAC':tipo==='mp4a'?'AAC':tipo,canais:be16(b,e+24),taxa:be16(b,e+32),bits:be16(b,e+26)||undefined,duracao:dur};break}
 if(!r.tecnico.codec)r.tecnico={duracao:dur};if(dur)r.tecnico.bitrate=Math.round(b.length*8/dur/1000);
 const udta=filho(b,moov,'udta'),meta=udta&&filho(b,udta,'meta'),ilst=meta&&caixas(b,meta.ini+4,meta.fim).find(c=>c.tipo==='ilst');
 if(ilst)for(const it of caixas(b,ilst.ini,ilst.fim)){const dt=filho(b,it,'data');if(!dt)continue;const tipo=be32(b,dt.ini)&0xFFFFFF,dados=b.subarray(dt.ini+8,dt.fim);
  if(it.tipo==='covr'){if(!r.capa)r.capa={mime:tipo===14?'image/png':'image/jpeg',dados:dados.slice()}}
  else if(it.tipo==='trkn'){if(dados.length>=4&&be16(dados,2))r.faixa=String(be16(dados,2))+(dados.length>=6&&be16(dados,4)?'/'+be16(dados,4):'')}
  else if(MI[it.tipo]&&tipo===1){const v=utf8(dados).trim();if(v&&!r[MI[it.tipo]])r[MI[it.tipo]]=MI[it.tipo]==='ano'?v.slice(0,4):v}}
 return r}
// ---------------- entrada ----------------
function lerMetadados(b){if(!b||b.length<8)return{formato:null};
 try{if(A(b,0,'RIFF')&&A(b,8,'WAVE'))return wav(b);if(A(b,0,'fLaC'))return flac(b);if(A(b,0,'OggS'))return ogg(b);if(A(b,4,'ftyp'))return m4a(b);
  if(A(b,0,'ID3')||quadro(b,0))return mp3(b)}catch(e){return{formato:null,erro:String(e.message||e)}}
 return{formato:null}}
// picos da forma de onda: para cada uma das n colunas, o menor e o maior valor entre todos os canais
function picos(canais,n){const total=canais[0]?canais[0].length:0,min=new Float32Array(n),max=new Float32Array(n);if(!total)return{min,max};
 for(let c=0;c<n;c++){const a=Math.floor(c*total/n),z=Math.max(a+1,Math.floor((c+1)*total/n));let lo=1,hi=-1;const passo=Math.max(1,(z-a)>>6);
  for(const ch of canais)for(let i=a;i<z;i+=passo){const v=ch[i];if(v<lo)lo=v;if(v>hi)hi=v}min[c]=lo>hi?0:lo;max[c]=hi<lo?0:hi}return{min,max}}
function formatarTempo(s){if(!isFinite(s)||s<0)return'0:00';s=Math.floor(s);const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60,p=n=>String(n).padStart(2,'0');return h?`${h}:${p(m)}:${p(x)}`:`${m}:${p(x)}`}
const api={lerMetadados,picos,formatarTempo,genero};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.UDSAudioMeta=api;
})(typeof window!=='undefined'?window:globalThis);
