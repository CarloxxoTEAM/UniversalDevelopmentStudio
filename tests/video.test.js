// Testes da leitura de dados técnicos de vídeo (1.40). Os arquivos de amostra são reais (ffmpeg)
// e o gabarito (tests/amostras/video/verdade.json) vem do ffprobe, não do próprio leitor.
const test=require('node:test'),assert=require('node:assert'),fs=require('node:fs'),path=require('node:path');
const M=require('../src/videometa.js'),DET=require('../src/deteccao.js');
const DIR=path.join(__dirname,'amostras','video'),V=JSON.parse(fs.readFileSync(path.join(DIR,'verdade.json'),'utf8'));
const bytes=n=>fs.readFileSync(path.join(DIR,n));
const leitorDe=buf=>async(o,t)=>new Uint8Array(buf.subarray(o,o+t));
const identifica=(n,buf)=>DET.identificar({nome:'sem-extensao',head:[...buf.subarray(0,512)]}).formato;
async function ler(n){const buf=bytes(n),f=identifica(n,buf);return{r:await M.lerVideo(leitorDe(buf),buf.length,f&&f.id),f,tam:buf.length}}
const perto=(a,b,tol,msg)=>assert.ok(Math.abs(a-b)<=tol,`${msg}: ${a} vs ${b}`);
const CODEC={h264:'H.264',hevc:'H.265 (HEVC)',av1:'AV1',vp8:'VP8',vp9:'VP9',h263:'H.263',mpeg4:'MPEG-4 Parte 2',mjpeg:'Motion JPEG',theora:'Theora',prores:'ProRes 422 LT',
 aac:'AAC',mp3:'MP3',opus:'Opus',vorbis:'Vorbis',pcm_s16le:'PCM'};
const COM_LEITOR=n=>!/mpeg2|m2ts|transporte|wmv/.test(n);// MPEG/TS/WMV: só informações básicas

test('todas as amostras são identificadas como vídeo (categoria v) pelo conteúdo',()=>{
 const esperado={'h264-aac-moov-no-fim.mp4':'mp4','quicktime.mov':'mov','celular.3gp':'3gp','vp9-opus.webm':'webm','h264-aac.mkv':'mkv','mpeg4-mp3.avi':'avi','flv-h264.flv':'flv','theora-vorbis.ogv':'ogv','mpeg2.mpg':'mpeg','mpegts.m2ts':'m2ts','transporte.ts':'m2ts','wmv2.wmv':'wmv'};
 for(const [n,id] of Object.entries(esperado)){const f=identifica(n,bytes(n));assert.equal(f&&f.id,id,n);assert.equal(f.cat,'v',n)}});
test('contêiner, duração, resolução, fps e codecs coincidem com o ffprobe',async()=>{
 for(const [n,v] of Object.entries(V)){if(!COM_LEITOR(n))continue;const{r}=await ler(n);
  if(!/fragmentado/.test(n))perto(r.duracao,v.duracao,0.05,n+' duração');
  assert.ok(r.video,n+' sem vídeo');assert.equal(r.video.largura,v.video.largura,n+' largura');assert.equal(r.video.altura,v.video.altura,n+' altura');
  assert.equal(r.video.codec,CODEC[v.video.codec],n+' codec de vídeo');
  if(!/fragmentado/.test(n))perto(r.video.fps,v.video.fps,0.02,n+' fps');
  if(v.audio){assert.ok(r.audio,n+' sem áudio');assert.equal(r.audio.codec,CODEC[v.audio.codec],n+' codec de áudio');assert.equal(r.audio.canais,v.audio.canais,n+' canais');assert.equal(r.audio.taxa,v.audio.taxa,n+' taxa')}
  else assert.equal(r.audio,null,n+' não deveria ter áudio')}});
test('perfil e nível (H.264/HEVC) coincidem com o ffprobe',async()=>{
 for(const [n,v] of Object.entries(V)){if(!COM_LEITOR(n)||!/^(h264|hevc)$/.test(v.video.codec)||/\.flv$/.test(n))continue;/* FLV não guarda perfil nos metadados */const{r}=await ler(n);
  assert.equal(r.video.perfil,v.video.perfil,n+' perfil');assert.equal(r.video.nivelNum,v.video.nivel,n+' nível')}});
test('taxa de bits total e por faixa (MP4/MOV/3GP) coincidem com o ffprobe',async()=>{
 for(const [n,v] of Object.entries(V)){if(!/\.(mp4|mov|3gp)$/.test(n)||/fragmentado/.test(n))continue;const{r}=await ler(n);
  perto(r.bitrate/v.bitrate,1,0.02,n+' total');if(v.video.bitrate)perto(r.video.bitrate/v.video.bitrate,1,0.03,n+' vídeo');if(v.audio&&v.audio.bitrate>=32000)perto(r.audio.bitrate/v.audio.bitrate,1,0.03,n+' áudio')/* abaixo de 32 kbps o ffprobe informa o nominal do esds, não o real */}});
test('rotação do celular (matriz do tkhd) e título/data de criação',async()=>{
 assert.equal((await ler('girado.mp4')).r.video.rotacao,V['girado.mp4'].video.rotacao);assert.equal((await ler('h264-aac-moov-no-fim.mp4')).r.video.rotacao,0);
 for(const n of ['h264-aac-moov-no-fim.mp4','h264-aac-faststart.mp4','h264-aac.mkv']){const{r}=await ler(n),tg=V[n].tags;if(tg.title)assert.equal(r.titulo,tg.title,n+' título');
  if(tg.creation_time)assert.equal(r.criado,tg.creation_time.replace('.000000Z','Z'),n+' criado')}});
test('MP4 com "moov" no fim e MP4 faststart dão o mesmo resultado, e vídeo sem áudio funciona',async()=>{
 const a=(await ler('h264-aac-moov-no-fim.mp4')).r;assert.equal(a.video.codec,'H.264');assert.equal(a.audio.codec,'AAC');assert.equal((await ler('h264-sem-audio.mp4')).r.audio,null)});
test('MP4 fragmentado: codecs e resolução vêm do moov; duração fica 0 (o player informa)',async()=>{
 const{r}=await ler('fragmentado.mp4');assert.equal(r.video.largura,160);assert.equal(r.video.codec,'H.264');assert.equal(r.duracao,0)});
test('arquivo grande: só lê trechos pequenos (moov no fim de um arquivo de 400 MB)',async()=>{
 const real=bytes('h264-aac-moov-no-fim.mp4');let p=0,ftyp,moov;while(p<real.length){const t=real.readUInt32BE(p),tipo=real.toString('latin1',p+4,p+8);if(tipo==='ftyp')ftyp=real.subarray(p,p+t);if(tipo==='moov')moov=real.subarray(p,p+t);p+=t}
 const GRANDE=400*1024*1024,mdat=Buffer.alloc(8);mdat.writeUInt32BE(GRANDE,0);mdat.write('mdat',4,'latin1');const ini=ftyp.length,mfim=ini+GRANDE,total=mfim+moov.length;let lidos=0,chamadas=0;
 const leitor=async(o,t)=>{chamadas++;const out=Buffer.alloc(Math.max(0,Math.min(t,total-o)));for(let i=0;i<out.length;i++){const x=o+i;out[i]=x<ini?ftyp[x]:x<ini+8?mdat[x-ini]:x<mfim?0:moov[x-mfim]}lidos+=out.length;return new Uint8Array(out)};
 const r=await M.lerVideo(leitor,total,'mp4');assert.equal(r.video.codec,'H.264');assert.equal(r.video.largura,160);perto(r.duracao,1,0.05,'duração');
 assert.ok(lidos<moov.length+1024,'leu '+lidos+' bytes');assert.ok(chamadas<10,'chamadas '+chamadas)});
test('arquivos truncados, corrompidos ou vazios nunca lançam erro',async()=>{
 for(const n of Object.keys(V)){const buf=bytes(n),id=(identifica(n,buf)||{}).id;
  for(const cut of [0,3,12,40,200,Math.floor(buf.length/2)]){const r=await M.lerVideo(leitorDe(buf.subarray(0,cut)),cut,id);assert.ok(r&&typeof r==='object',n+' '+cut)}
  const ruim=Buffer.from(buf);for(let i=0;i<ruim.length;i+=7)ruim[i]^=0xA5;assert.ok(await M.lerVideo(leitorDe(ruim),ruim.length,id),n+' corrompido')}
 assert.ok(await M.lerVideo(leitorDe(Buffer.alloc(0)),0,'mp4'));assert.ok(await M.lerVideo(leitorDe(Buffer.alloc(10)),10,'formato-que-nao-existe'))});
test('formatação de taxa de bits e fps',()=>{
 assert.equal(M.formatarTaxa(0),'');assert.equal(M.formatarTaxa(96000),'96 kbps');assert.equal(M.formatarTaxa(2500000),'2,50 Mbps');
 assert.equal(M.formatarFps(25),'25 fps');assert.equal(M.formatarFps(29.97003),'29,97 fps');assert.equal(M.formatarFps(0),'')});
test('extensões equivalentes (.ts/.mts, .3g2, .mkv com WebM, .m4v) não geram aviso de conflito e abrem no visualizador de vídeo',()=>{
 const t=(nome,arq)=>DET.identificar({nome,head:[...bytes(arq).subarray(0,512)]});
 for(const [nome,arq] of [['a.ts','transporte.ts'],['a.mts','mpegts.m2ts'],['a.3g2','celular.3gp'],['a.mkv','vp9-opus.webm'],['a.m4v','h264-aac-moov-no-fim.mp4'],['a.f4v','flv-h264.flv'],['a.vob','mpeg2.mpg']]){const r=t(nome,arq);assert.equal(r.conflito,false,nome);assert.equal(r.formato.cat,'v',nome);assert.equal(r.vis,null,nome)}
 assert.equal(t('a.mp4','celular.3gp').conflito,true)});
test('o visualizador de vídeo carrega, se registra e só aceita vídeo (não Lottie, áudio nem texto)',()=>{
 const vm=require('node:vm'),sb={console};sb.window=sb;sb.globalThis=sb;sb.UDSCore=require('../src/core.js');sb.UDSVideoMeta=M;vm.createContext(sb);
 for(const f of ['visualizadores/registro.js','visualizadores/video.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..','src',f),'utf8'),sb,{filename:f});
 const v=sb.UDS.viewers.find(x=>x.id==='video');assert.ok(v,'não registrou');
 const d=(cat,texto)=>({det:{formato:{cat,texto}}});
 assert.equal(v.match('a.mp4',d('v')),true);assert.equal(v.match('a.json',d('v',true)),false);assert.equal(v.match('a.mp3',d('a')),false);
 assert.equal(v.match('a.mkv',{}),true);assert.equal(v.match('a.txt',{}),false)});
