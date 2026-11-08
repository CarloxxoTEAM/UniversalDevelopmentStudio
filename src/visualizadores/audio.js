// Visualizador de áudio (1.30): reprodução, forma de onda, capa, etiquetas e dados técnicos.
// Formatos que o sistema toca (WebView2: MP3, WAV, FLAC, OGG, Opus, AAC, M4A); os demais mostram só as informações.
(function(){
const {extOf,esc}=UDSCore,M=UDSAudioMeta;
const EXT=['mp3','wav','flac','aac','ogg','oga','m4a','opus','wma','aiff','aif','alac','mid','midi','amr','pcm'];
const LIMITE=40*1024*1024; // acima disso não lê o arquivo inteiro (forma de onda e etiquetas)
const tam=n=>n>=1048576?(n/1048576).toFixed(1)+' MB':(n/1024).toFixed(1)+' KB';
const canaisTxt=n=>n===1?'Mono':n===2?'Estéreo':n?n+' canais':'';
async function ondaDe(buf){let ctx;try{ctx=new OfflineAudioContext(1,1,8000)}catch(e){if(buf.byteLength>12*1048576)throw e;ctx=new (window.AudioContext||window.webkitAudioContext)()}
 const a=await ctx.decodeAudioData(buf);const canais=[];for(let i=0;i<a.numberOfChannels;i++)canais.push(a.getChannelData(i));return{picos:M.picos(canais,1200),dur:a.duration}}
UDS.registerViewer({id:'audio',nome:'Áudio',
 match:(p,d)=>{const f=d.det&&d.det.formato;return !!(f&&f.cat==='a')||EXT.includes(extOf(p))},
 open(p,d,box,ctx){
  const nomeArq=p.split(/[\\/]/).pop(),det=d.det&&d.det.formato;
  box.innerHTML=`<div class="au" tabindex="0"><div class="au-topo"><div class="au-capa" id="au-capa"></div><div class="au-info"><div class="au-titulo" id="au-t"></div><div class="au-sub" id="au-s"></div><div class="hint" id="au-h"></div></div></div>
   <canvas class="au-onda" id="au-c" height="110" aria-label="Forma de onda: clique para ir a um ponto"></canvas>
   <div class="au-ctl"><button id="au-pp" class="au-play" aria-label="Tocar">▶</button><span id="au-tm" class="au-tm">0:00 / 0:00</span><input type="range" id="au-sk" min="0" max="1000" value="0" aria-label="Posição">
    <button id="au-mu" aria-label="Silenciar" title="Silenciar (M)">🔊</button><input type="range" id="au-vo" min="0" max="100" aria-label="Volume" style="width:80px">
    <select id="au-vl" aria-label="Velocidade">${[.5,.75,1,1.25,1.5,2].map(v=>`<option value="${v}">${v}×</option>`).join('')}</select><button id="au-lp" aria-pressed="false" title="Repetir">↻</button></div>
   <div class="au-aviso" id="au-av"></div><table class="au-tec" id="au-tec"></table><audio id="au-a" preload="metadata"></audio></div>`;
  const $=s=>box.querySelector(s),au=$('#au-a'),cv=$('#au-c'),pp=$('#au-pp'),sk=$('#au-sk'),vo=$('#au-vo'),tm=$('#au-tm'),raiz=$('.au');
  let vivo=true,picos=null,durOnda=0,meta={},capaUrl=null,raf=0,pronto=false;
  const dur=()=>isFinite(au.duration)&&au.duration>0?au.duration:(meta.tecnico&&meta.tecnico.duracao)||durOnda||0;
  const est=d.estadoAudio||{};
  // ---- forma de onda ----
  function desenha(){if(!vivo)return;const w=cv.clientWidth||600,h=110,dpr=window.devicePixelRatio||1;if(cv.width!==Math.round(w*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr)}
   const g=cv.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,w,h);const st=getComputedStyle(document.documentElement),ac=st.getPropertyValue('--ac').trim()||'#2f6df0',mudo=st.getPropertyValue('--tx2').trim()||'#888',D=dur(),prog=D?Math.min(1,au.currentTime/D):0;
   if(!picos){g.fillStyle=mudo;g.fillRect(0,h/2-.5,w,1)}
   else{const n=picos.max.length;for(let x=0;x<w;x+=3){const c=Math.min(n-1,Math.floor(x/w*n)),y1=h/2-picos.max[c]*h/2*.95,y2=h/2-picos.min[c]*h/2*.95;g.fillStyle=x/w<prog?ac:mudo;g.fillRect(x,y1,2,Math.max(1.5,y2-y1))}}
   g.fillStyle=ac;g.fillRect(prog*w-1,0,2,h)}
  function atualiza(){const D=dur();tm.textContent=`${M.formatarTempo(au.currentTime)} / ${M.formatarTempo(D)}`;if(D&&document.activeElement!==sk)sk.value=Math.round(au.currentTime/D*1000);desenha()}
  function loop(){atualiza();if(vivo&&!au.paused)raf=requestAnimationFrame(loop)}
  // ---- controles ----
  const vol=v=>{au.volume=Math.max(0,Math.min(1,v));vo.value=Math.round(au.volume*100);if(ctx.cfg){ctx.cfg.audioVol=au.volume;clearTimeout(vol.t);vol.t=setTimeout(()=>ctx.saveCfg&&ctx.saveCfg(),400)}$('#au-mu').textContent=au.muted||au.volume===0?'🔇':'🔊'};
  const alterna=()=>au.paused?au.play().catch(()=>{}):au.pause(),vai=t=>{const D=dur();if(D){au.currentTime=Math.max(0,Math.min(D,t));atualiza()}};
  pp.onclick=alterna;au.onplay=()=>{pp.textContent='❚❚';pp.setAttribute('aria-label','Pausar');cancelAnimationFrame(raf);loop()};au.onpause=()=>{pp.textContent='▶';pp.setAttribute('aria-label','Tocar');atualiza()};
  au.ontimeupdate=()=>{if(au.paused)atualiza()};au.onseeked=atualiza;au.onended=()=>{pp.textContent='▶';atualiza()};au.onloadedmetadata=()=>{pronto=true;if(est.tempo&&est.tempo<au.duration)au.currentTime=est.tempo;if(est.tocando)au.play().catch(()=>{});atualiza();tec()};
  sk.oninput=()=>vai(sk.value/1000*dur());cv.onclick=e=>{const r=cv.getBoundingClientRect();vai((e.clientX-r.left)/r.width*dur())};
  vo.oninput=()=>{au.muted=false;vol(vo.value/100)};$('#au-mu').onclick=()=>{au.muted=!au.muted;vol(au.volume)};
  $('#au-vl').onchange=e=>{au.playbackRate=+e.target.value};$('#au-lp').onclick=()=>{au.loop=!au.loop;$('#au-lp').setAttribute('aria-pressed',au.loop);$('#au-lp').classList.toggle('on',au.loop)};
  raiz.onkeydown=e=>{if(e.target.matches('input,select'))return;const k=e.key;if(k===' '){e.preventDefault();alterna()}else if(k==='ArrowLeft'){e.preventDefault();vai(au.currentTime-5)}else if(k==='ArrowRight'){e.preventDefault();vai(au.currentTime+5)}else if(k==='ArrowUp'){e.preventDefault();vol(au.volume+.05)}else if(k==='ArrowDown'){e.preventDefault();vol(au.volume-.05)}else if(k==='m'||k==='M')$('#au-mu').click()};
  au.onerror=()=>{const f=det?det.nome:extOf(p).toUpperCase();$('#au-av').textContent=`⚠ O sistema não consegue reproduzir este formato (${f}). As informações do arquivo continuam disponíveis abaixo.`;[pp,sk,vo,$('#au-vl'),$('#au-lp'),$('#au-mu')].forEach(x=>x.disabled=true)};
  // ---- informações ----
  function tec(){const t=meta.tecnico||{},f=det?det.nome:'',L=[['Formato',f+(d.det&&d.det.via==='conteudo'?' (pelo conteúdo)':'')],['Codec',t.codec],['Duração',dur()?M.formatarTempo(dur()):''],['Taxa de amostragem',t.taxa?t.taxa+' Hz':''],['Canais',canaisTxt(t.canais)],['Profundidade',t.bits?t.bits+' bits':''],['Taxa de bits',t.bitrate?t.bitrate+' kbps'+(t.vbr?' (variável)':''):''],['Tamanho',tam(d.size||0)],['Tipo MIME',(det&&det.mime)||d.mime||'']];
   const E=[['Título',meta.titulo],['Artista',meta.artista],['Artista do álbum',meta.artistaAlbum],['Álbum',meta.album],['Ano',meta.ano],['Faixa',meta.faixa],['Disco',meta.disco],['Gênero',meta.genero],['Comentário',meta.comentario]].filter(x=>x[1]);
   $('#au-tec').innerHTML=`<tr><th colspan="2">Dados técnicos</th></tr>`+L.filter(x=>x[1]).map(([k,v])=>`<tr><td>${k}</td><td>${esc(v)}</td></tr>`).join('')+(E.length?`<tr><th colspan="2">Etiquetas</th></tr>`+E.map(([k,v])=>`<tr><td>${k}</td><td>${esc(v)}</td></tr>`).join(''):'')}
  function cabecalho(){const sem=nomeArq.replace(/\.[^.]+$/,'');$('#au-t').textContent=meta.titulo||sem;$('#au-s').textContent=[meta.artista,meta.album].filter(Boolean).join(' · ')||(det?det.nome:'');$('#au-h').textContent=[meta.ano,meta.genero,meta.faixa&&'faixa '+meta.faixa].filter(Boolean).join(' · ');
   const c=$('#au-capa');if(meta.capa&&!capaUrl){capaUrl=URL.createObjectURL(new Blob([meta.capa.dados],{type:meta.capa.mime}));c.innerHTML=`<img alt="Capa do álbum" src="${capaUrl}">`}else if(!meta.capa)c.innerHTML='<span>♪</span>'}
  // ---- início ----
  vol(est.volume!=null?est.volume:(ctx.cfg&&ctx.cfg.audioVol!=null?ctx.cfg.audioVol:.8));au.muted=!!est.mudo;vol(au.volume);if(est.velocidade){au.playbackRate=est.velocidade;$('#au-vl').value=est.velocidade}if(est.repetir)$('#au-lp').click();
  au.src=ctx.url(p);if(est.velocidade)au.defaultPlaybackRate=au.playbackRate=est.velocidade;cabecalho();tec();desenha();
  (async()=>{
   if(d.audio){meta=d.audio.meta;picos=d.audio.picos;durOnda=d.audio.dur||0;cabecalho();tec();desenha();return}
   if((d.size||0)>LIMITE){$('#au-av').textContent=`Arquivo grande (${tam(d.size)}): a forma de onda e as etiquetas ficam desativadas para o programa continuar rápido.`;return}
   let buf;try{buf=await (await fetch(ctx.url(p))).arrayBuffer()}catch(e){return}if(!vivo)return;
   meta=M.lerMetadados(new Uint8Array(buf));cabecalho();tec();
   try{const o=await ondaDe(buf.slice(0));if(!vivo)return;picos=o.picos;durOnda=o.dur}catch(e){if(vivo&&!$('#au-av').textContent)$('#au-av').textContent='Forma de onda indisponível para este arquivo.'}
   if(!vivo)return;d.audio={meta,picos,dur:durOnda};tec();desenha()})();
  window.addEventListener('resize',desenha);
  ctx.onLimpar(()=>{vivo=false;cancelAnimationFrame(raf);window.removeEventListener('resize',desenha);d.estadoAudio={tempo:pronto?au.currentTime:est.tempo||0,tocando:!au.paused&&!au.ended,volume:au.volume,mudo:au.muted,velocidade:au.playbackRate,repetir:au.loop};au.pause();au.removeAttribute('src');au.load();if(capaUrl)URL.revokeObjectURL(capaUrl)});
  raiz.focus({preventScroll:true})}
});
})();
