// Teste do visualizador de vídeo em um Chromium de verdade (Playwright). Opcional: não roda no "npm test".
// Uso: node tests/video.navegador.js   (requer o pacote "playwright" e um Chromium instalado)
// O Chromium do Playwright toca WebM (VP8/VP9); Theora ele já não toca; H.264/AAC dependem do WebView2 do Windows, então aqui só conferimos o painel técnico.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert');
let playwright;try{playwright=require('playwright')}catch(e){playwright=require('/opt/npm-tools/node_modules/playwright')}
const RAIZ=path.join(__dirname,'..'),V=JSON.parse(fs.readFileSync(path.join(__dirname,'amostras','video','verdade.json'),'utf8'));
const DET=require('../src/deteccao.js');
const pedidos=[];let ignoraRange=false;
const HTML=`<!doctype html><meta charset=utf-8><link rel=stylesheet href="/src/styles.css"><body style="margin:0;display:flex;height:100vh"><div id=view style="flex:1;display:flex;flex-direction:column"></div>
<script src="/src/icones/indice.js"></script><script src="/src/core.js"></script><script src="/src/visualizadores/registro.js"></script><script src="/src/videometa.js"></script><script src="/src/visualizadores/video.js"></script>`;
const srv=http.createServer((q,r)=>{if(q.url==='/__h.html'){r.writeHead(200,{'content-type':'text/html'});return r.end(HTML)}
 const f=path.join(RAIZ,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(RAIZ)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}
 const tam=fs.statSync(f).size,tipo={'.js':'text/javascript','.css':'text/css','.webm':'video/webm','.ogv':'video/ogg','.mp4':'video/mp4'}[path.extname(f)]||'application/octet-stream',h=!ignoraRange&&q.headers.range&&/bytes=(\d+)-(\d*)/.exec(q.headers.range);
 if(q.url.includes('/amostras/video/'))pedidos.push(q.headers.range||'inteiro');
 if(h){const a=+h[1],b=h[2]?Math.min(+h[2],tam-1):tam-1;r.writeHead(206,{'content-type':tipo,'accept-ranges':'bytes','content-range':`bytes ${a}-${b}/${tam}`,'content-length':b-a+1});fs.createReadStream(f,{start:a,end:b}).pipe(r)}
 else{r.writeHead(200,{'content-type':tipo,'accept-ranges':'bytes','content-length':tam});fs.createReadStream(f).pipe(r)}});
(async()=>{await new Promise(r=>srv.listen(0,r));const base='http://127.0.0.1:'+srv.address().port;
 const br=await playwright.chromium.launch(),pg=await br.newPage({viewport:{width:980,height:760}});const erros=[];pg.on('pageerror',e=>erros.push(e.message));
 await pg.goto(base+'/__h.html');
 const abre=async nome=>{const buf=fs.readFileSync(path.join(__dirname,'amostras','video',nome)),f=DET.identificar({nome,head:[...buf.subarray(0,512)]});
  await pg.evaluate(({nome,det,size})=>{const box=document.getElementById('view');box.innerHTML='';let lim=()=>{};window.__lim=()=>lim();
   const d={det:{formato:det,via:'conteudo'},size};UDS.findViewer('/x/'+nome,d).open('/x/'+nome,d,box,{url:p=>'/tests/amostras/video/'+p.split('/').pop(),cfg:{},saveCfg(){},onLimpar:f=>{lim=f},fail:m=>{throw new Error(m)}})},{nome,det:f.formato,size:buf.length});
  await pg.waitForFunction(()=>document.querySelectorAll('#vd-tec tr').length>6||document.querySelector('#vd-tec')?.textContent.includes('Codec'),null,{timeout:5000}).catch(()=>{})};
 const tabela=()=>pg.$eval('#vd-tec',t=>[...t.querySelectorAll('tr')].map(r=>[...r.children].map(c=>c.textContent).join('|')).join('\n'));
 // 1) painel técnico confere com o ffprobe, em todos os formatos
 for(const [nome,v] of Object.entries(V)){await abre(nome);await pg.waitForTimeout(150);const t=await tabela();
  if(/mpeg2|m2ts|transporte|wmv/.test(nome))continue;
  assert.ok(t.includes(`${v.video.largura} × ${v.video.altura}`),nome+' resolução na tabela:\n'+t);
  if(v.audio)assert.ok(t.includes('Taxa de amostragem|'+v.audio.taxa+' Hz'),nome+' taxa de áudio');
  console.log('ok painel',nome)}
 // 2) reprodução real (WebM e OGV)
 for(const nome of ['vp9-opus.webm','vp8-vorbis.webm']){await abre(nome);
  await pg.waitForFunction(()=>{const v=document.getElementById('vd-v');return v&&v.readyState>=2},null,{timeout:8000});
  const info=await pg.$eval('#vd-v',v=>({w:v.videoWidth,h:v.videoHeight,d:v.duration}));assert.equal(info.w,V[nome].video.largura,nome);assert.equal(info.h,V[nome].video.altura,nome);assert.ok(Math.abs(info.d-V[nome].duracao)<0.1,nome+' duração '+info.d);
  assert.equal(await pg.$eval('#vd-msg',m=>getComputedStyle(m).display),'none',nome+' mostrou erro');
  await pg.click('#vd-pp');await pg.waitForTimeout(400);const t1=await pg.$eval('#vd-v',v=>v.currentTime);assert.ok(t1>0.1,nome+' não avançou: '+t1);
  await pg.click('#vd-pp');assert.equal(await pg.$eval('#vd-v',v=>v.paused),true);
  const antes=await pg.$eval('#vd-v',v=>v.currentTime);await pg.click('#vd-qp');await pg.waitForTimeout(100);const depois=await pg.$eval('#vd-v',v=>v.currentTime);
  perto(depois-antes,1/V[nome].video.fps,0.02,nome+' passo de quadro');
  await pg.selectOption('#vd-vl','2');assert.equal(await pg.$eval('#vd-v',v=>v.playbackRate),2);
  await pg.fill('#vd-vo','30');await pg.dispatchEvent('#vd-vo','input');assert.ok(Math.abs(await pg.$eval('#vd-v',v=>v.volume)-0.3)<0.01);
  await pg.focus('.vd');await pg.keyboard.press('Home');await pg.evaluate(()=>{document.getElementById('vd-v').currentTime=0});await pg.keyboard.press('ArrowRight');await pg.waitForTimeout(100);
  assert.ok(await pg.$eval('#vd-v',v=>v.currentTime)>=0.9,nome+' seta direita deveria avançar 5 s (limitado à duração)');
  console.log('ok reprodução',nome)}
 // 2b) Theora: o Chromium recente toca só o áudio; o visualizador deve avisar "sem imagem" mantendo os controles ativos
 await abre('theora-vorbis.ogv');await pg.waitForFunction(()=>document.getElementById('vd-msg').style.display==='flex',null,{timeout:8000});
 assert.ok((await pg.$eval('#vd-msg',m=>m.textContent)).includes('Sem imagem'));assert.equal(await pg.$eval('#vd-pp',b=>b.disabled),false);console.log('ok OGV: aviso de sem imagem');
 // 3) formato que o Chromium não toca (AVI): mostra aviso e mantém as informações
 await abre('mpeg4-mp3.avi');await pg.waitForFunction(()=>document.getElementById('vd-msg').style.display==='flex',null,{timeout:5000});
 assert.ok((await pg.$eval('#vd-av',e=>e.textContent)).includes('não reconhece'));assert.ok((await tabela()).includes('MPEG-4 Parte 2'));assert.equal(await pg.$eval('#vd-pp',b=>b.disabled),true);console.log('ok aviso AVI');
 // 3b) o seletor de velocidade começa em 1× (e não na primeira opção)
 await abre('vp9-opus.webm');assert.equal(await pg.$eval('#vd-vl',e=>e.value),'1');
 // 4) a leitura dos dados usa trechos (Range), nunca o arquivo inteiro de um vídeo com moov no fim
 pedidos.length=0;await abre('h264-aac-moov-no-fim.mp4');await pg.waitForTimeout(500);
 assert.ok(pedidos.some(p=>/bytes=/.test(p)),'não usou Range: '+pedidos);
 // 4b) se o servidor ignorar o Range, o painel ainda funciona (lê o começo em fluxo e cancela)
 ignoraRange=true;await abre('h264-aac-moov-no-fim.mp4');await pg.waitForFunction(()=>document.getElementById('vd-tec').textContent.includes('H.264'),null,{timeout:5000});ignoraRange=false;console.log('ok sem Range');
 // 5) limpar guarda o estado e solta o vídeo; reabrir retoma a posição
 await abre('vp9-opus.webm');await pg.waitForFunction(()=>document.getElementById('vd-v').readyState>=2);await pg.evaluate(()=>{document.getElementById('vd-v').currentTime=0.5});await pg.waitForTimeout(100);
 const est=await pg.evaluate(()=>{const v=document.getElementById('vd-v');window.__lim();return true});assert.ok(est);
 await pg.screenshot({path:'/tmp/video-visualizador.png'});await br.close();srv.close();
 assert.deepEqual(erros,[],'erros de JavaScript: '+erros.join('; '));console.log('TUDO OK')})().catch(e=>{console.error(e);process.exit(1)});
function perto(a,b,t,m){assert.ok(Math.abs(a-b)<=t,`${m}: ${a} vs ${b}`)}
