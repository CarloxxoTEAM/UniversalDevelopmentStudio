// Visualizador de vídeo (1.40): reprodução, controles, passo por quadro, tela cheia e dados técnicos.
// Quem decide se o vídeo toca é o sistema (WebView2/WebKit): MP4/H.264, WebM, OGV e, conforme os codecs, MKV/MOV/3GP.
// Os demais formatos (AVI, FLV, WMV, MPEG, TS) mostram só as informações. Os dados técnicos vêm de UDSVideoMeta, lendo apenas trechos do arquivo.
(function(){
const {extOf,esc}=UDSCore,M=UDSVideoMeta;
const EXT=['mp4','m4v','mkv','avi','mov','webm','wmv','flv','f4v','mpeg','mpg','3gp','3g2','ogv','m2ts','mts','vob'];
const tam=n=>n>=1073741824?(n/1073741824).toFixed(2).replace('.',',')+' GB':n>=1048576?(n/1048576).toFixed(1).replace('.',',')+' MB':(n/1024).toFixed(1).replace('.',',')+' KB';
const tempo=s=>{if(!isFinite(s)||s<0)return'0:00';s=Math.floor(s);const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60,p=n=>String(n).padStart(2,'0');return h?`${h}:${p(m)}:${p(x)}`:`${m}:${p(x)}`};
const canaisTxt=n=>n===1?'Mono':n===2?'Estéreo':n===6?'5.1':n?n+' canais':'';
// Leitor por trechos: pede só os bytes necessários (Range). Se o pedido com Range falhar ou for ignorado, lê o começo
// do arquivo em fluxo e cancela (só até 64 MB; além disso desiste, e o painel mostra "Leitura parcial").
function leitorHttp(url){
 const fluxo=async(off,len)=>{if(off>64*1048576)throw new Error('o sistema não aceita leitura por trechos');const ac=new AbortController(),r=await fetch(url,{signal:ac.signal}),rd=r.body.getReader(),partes=[];let n=0;
  while(n<off+len){const x=await rd.read();if(x.done)break;partes.push(x.value);n+=x.value.length}ac.abort();
  const tudo=new Uint8Array(n);let o=0;for(const x of partes){tudo.set(x,o);o+=x.length}return tudo.subarray(off,off+len)};
 let semRange=false;
 return async(off,len)=>{if(!semRange){try{const r=await fetch(url,{headers:{Range:`bytes=${off}-${off+len-1}`}});if(r.status===206)return new Uint8Array(await r.arrayBuffer());semRange=true;if(r.body)r.body.cancel().catch(()=>{})}catch(e){semRange=true}}
  return fluxo(off,len)}}
UDS.registerViewer({id:'video',nome:'Vídeo',
 match:(p,d)=>{const f=d.det&&d.det.formato;if(f)return f.cat==='v'&&!f.texto;return EXT.includes(extOf(p))},
 open(p,d,box,ctx){
  const nomeArq=p.split(/[\\/]/).pop(),det=d.det&&d.det.formato;
  box.innerHTML=`<div class="vd" tabindex="0"><div class="vd-tela" id="vd-tela"><video id="vd-v" preload="metadata" playsinline></video><div class="vd-msg" id="vd-msg"></div></div>
   <div class="au-ctl"><button id="vd-pp" class="au-play" aria-label="Tocar">▶</button><span id="vd-tm" class="au-tm">0:00 / 0:00</span><input type="range" id="vd-sk" min="0" max="1000" value="0" aria-label="Posição">
    <button id="vd-qa" title="Quadro anterior (,)" aria-label="Quadro anterior">⏮</button><button id="vd-qp" title="Próximo quadro (.)" aria-label="Próximo quadro">⏭</button>
    <button id="vd-mu" aria-label="Silenciar" title="Silenciar (M)">🔊</button><input type="range" id="vd-vo" min="0" max="100" aria-label="Volume" style="width:80px">
    <select id="vd-vl" aria-label="Velocidade">${[.25,.5,.75,1,1.25,1.5,2].map(v=>`<option value="${v}">${v}×</option>`).join('')}</select><button id="vd-lp" aria-pressed="false" title="Repetir (L)">↻</button><button id="vd-fs" title="Tela cheia (F)" aria-label="Tela cheia">⛶</button></div>
   <div class="au-aviso" id="vd-av"></div><table class="au-tec" id="vd-tec"></table></div>`;
  const $=s=>box.querySelector(s),v=$('#vd-v'),pp=$('#vd-pp'),sk=$('#vd-sk'),vo=$('#vd-vo'),tm=$('#vd-tm'),raiz=$('.vd'),tela=$('#vd-tela'),msg=$('#vd-msg');
  let vivo=true,pronto=false,meta=d.video||null,quebrou=false;const est=d.estadoVideo||{};
  const dur=()=>isFinite(v.duration)&&v.duration>0?v.duration:(meta&&meta.duracao)||0;
  const fps=()=>(meta&&meta.video&&meta.video.fps)||30;
  const atualiza=()=>{const D=dur();tm.textContent=`${tempo(v.currentTime)} / ${tempo(D)}`;if(D&&document.activeElement!==sk)sk.value=Math.round(v.currentTime/D*1000)};
  const vol=x=>{v.volume=Math.max(0,Math.min(1,x));vo.value=Math.round(v.volume*100);if(ctx.cfg){ctx.cfg.videoVol=v.volume;clearTimeout(vol.t);vol.t=setTimeout(()=>ctx.saveCfg&&ctx.saveCfg(),400)}$('#vd-mu').textContent=v.muted||v.volume===0?'🔇':'🔊'};
  const alterna=()=>v.paused?v.play().catch(()=>{}):v.pause(),vai=t=>{const D=dur();if(D){v.currentTime=Math.max(0,Math.min(D,t));atualiza()}};
  const quadro=n=>{v.pause();vai(v.currentTime+n/fps())};
  const telaCheia=()=>{if(document.fullscreenElement)document.exitFullscreen();else tela.requestFullscreen&&tela.requestFullscreen().catch(()=>{})};
  pp.onclick=alterna;v.onclick=alterna;v.ondblclick=telaCheia;
  v.onplay=()=>{pp.textContent='❚❚';pp.setAttribute('aria-label','Pausar')};v.onpause=()=>{pp.textContent='▶';pp.setAttribute('aria-label','Tocar');atualiza()};
  v.ontimeupdate=atualiza;v.onseeked=atualiza;v.onended=()=>{pp.textContent='▶';atualiza()};
  v.onloadedmetadata=()=>{pronto=true;checaImagem();if(est.tempo&&est.tempo<v.duration)v.currentTime=est.tempo;if(est.tocando)v.play().catch(()=>{});atualiza();tec()};
  sk.oninput=()=>vai(sk.value/1000*dur());vo.oninput=()=>{v.muted=false;vol(vo.value/100)};$('#vd-mu').onclick=()=>{v.muted=!v.muted;vol(v.volume)};
  $('#vd-vl').onchange=e=>{v.playbackRate=+e.target.value};$('#vd-lp').onclick=()=>{v.loop=!v.loop;$('#vd-lp').setAttribute('aria-pressed',v.loop);$('#vd-lp').classList.toggle('on',v.loop)};
  $('#vd-qa').onclick=()=>quadro(-1);$('#vd-qp').onclick=()=>quadro(1);$('#vd-fs').onclick=telaCheia;
  raiz.onkeydown=e=>{if(e.target.matches('input,select'))return;const k=e.key;
   if(k===' '){e.preventDefault();alterna()}else if(k==='ArrowLeft'){e.preventDefault();vai(v.currentTime-(e.shiftKey?10:5))}else if(k==='ArrowRight'){e.preventDefault();vai(v.currentTime+(e.shiftKey?10:5))}
   else if(k==='ArrowUp'){e.preventDefault();vol(v.volume+.05)}else if(k==='ArrowDown'){e.preventDefault();vol(v.volume-.05)}
   else if(k===','){quadro(-1)}else if(k==='.'){quadro(1)}else if(k==='m'||k==='M')$('#vd-mu').click();else if(k==='f'||k==='F')telaCheia();else if(k==='l'||k==='L')$('#vd-lp').click()};
  v.onerror=()=>{if(quebrou)return;quebrou=true;const f=det?det.nome:extOf(p).toUpperCase(),vc=meta&&meta.video?meta.video.codec:'';
   msg.textContent=`⚠ O sistema não consegue reproduzir este vídeo.`;msg.style.display='flex';
   $('#vd-av').textContent=`Formato ${f}${vc?', vídeo '+vc:''}${meta&&meta.audio?', áudio '+meta.audio.codec:''}: o tocador do sistema não reconhece este contêiner ou codec. As informações do arquivo continuam abaixo.`;
   [pp,sk,vo,$('#vd-vl'),$('#vd-lp'),$('#vd-mu'),$('#vd-qa'),$('#vd-qp'),$('#vd-fs')].forEach(x=>x.disabled=true)};
  // O sistema às vezes reconhece só o áudio (ex.: Theora no Chromium recente): sem imagem, mas com som
  function checaImagem(){if(!pronto||quebrou||v.videoWidth||(meta&&!meta.video&&meta.container))return;const vc=meta&&meta.video?meta.video.codec:'';
   msg.textContent=`⚠ Sem imagem: o sistema não reconhece o vídeo${vc?' ('+vc+')':''}${meta&&meta.audio?'. Só o áudio ('+meta.audio.codec+') pode ser tocado':''}.`;msg.style.display='flex';msg.style.pointerEvents='none'}
  // ---- informações ----
  function tec(){const m=meta||{},vi=m.video,au=m.audio,D=dur();
   const dim=vi&&vi.largura?`${vi.largura} × ${vi.altura}`:(v.videoWidth?`${v.videoWidth} × ${v.videoHeight}`:'');
   const L=[['Formato',(det?det.nome:'')+(d.det&&d.det.via==='conteudo'?' (pelo conteúdo)':'')],['Contêiner',m.container&&det&&m.container!==det.nome?m.container:''],['Duração',D?tempo(D):''],['Tamanho',tam(d.size||0)],['Taxa de bits total',M.formatarTaxa(m.bitrate)],['Título',m.titulo],['Criado em',m.criado]];
   const V=vi?[['Codec',vi.codec+(vi.perfil?' · '+vi.perfil:'')+(vi.nivel?' · nível '+vi.nivel:'')],['Resolução',dim],['Taxa de quadros',M.formatarFps(vi.fps)],['Taxa de bits',M.formatarTaxa(vi.bitrate)],['Rotação',vi.rotacao?vi.rotacao+'°':'']]:(dim?[['Resolução',dim]]:[]);
   const A=au?[['Codec',au.codec],['Taxa de amostragem',au.taxa?au.taxa+' Hz':''],['Canais',canaisTxt(au.canais)],['Taxa de bits',M.formatarTaxa(au.bitrate)]]:[];
   const bloco=(t,l)=>{const x=l.filter(y=>y[1]);return x.length?`<tr><th colspan="2">${t}</th></tr>`+x.map(([k,val])=>`<tr><td>${k}</td><td>${esc(String(val))}</td></tr>`).join(''):''};
   $('#vd-tec').innerHTML=bloco('Arquivo',L)+bloco('Vídeo',V)+bloco('Áudio',A)+(m.erro?`<tr><th colspan="2">Leitura parcial</th></tr><tr><td>Motivo</td><td>${esc(m.erro)}</td></tr>`:'')}
  // ---- início ----
  vol(est.volume!=null?est.volume:(ctx.cfg&&ctx.cfg.videoVol!=null?ctx.cfg.videoVol:.8));v.muted=!!est.mudo;vol(v.volume);
  $('#vd-vl').value='1';  if(est.velocidade){v.defaultPlaybackRate=v.playbackRate=est.velocidade;$('#vd-vl').value=est.velocidade}if(est.repetir)$('#vd-lp').click();
  v.src=ctx.url(p);tec();atualiza();
  (async()=>{if(meta)return;
   try{meta=await M.lerVideo(leitorHttp(ctx.url(p)),d.size||0,det&&det.id)}catch(e){meta={erro:String(e&&e.message||e)}}
   if(!vivo)return;d.video=meta;tec();atualiza();checaImagem()})();
  const sai=()=>{if(!document.fullscreenElement)return;};document.addEventListener('fullscreenchange',sai);
  ctx.onLimpar(()=>{vivo=false;document.removeEventListener('fullscreenchange',sai);if(document.fullscreenElement===tela)document.exitFullscreen().catch(()=>{});
   d.estadoVideo={tempo:pronto?v.currentTime:est.tempo||0,tocando:!v.paused&&!v.ended,volume:v.volume,mudo:v.muted,velocidade:v.playbackRate,repetir:v.loop};v.pause();v.removeAttribute('src');v.load()});
  raiz.focus({preventScroll:true})}
});
})();
