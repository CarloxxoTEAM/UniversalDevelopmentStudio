// Visualizar (1.4.2): janela de prévia flutuante, aberta pelo botão direito de qualquer arquivo ou pasta do explorador.
// Não abre aba e não altera nada. Reaproveita o registro de visualizadores (imagem, áudio, vídeo e os que vierem depois);
// texto e código abrem só para leitura; pastas mostram o conteúdo; os demais formatos mostram a tela de informações.
(function(root){
const IMAGENS=['png','jpg','jpeg','gif','webp','avif','bmp','ico','svg'];
const MAX_LINHAS=3000,MAX_ITENS=300,MAX_MINIATURAS=24;
// ---- funções puras (testadas sem tela) ----
function resumoPasta(entradas,extOf){const r={total:entradas.length,pastas:0,arquivos:0,imagens:[]};
 for(const e of entradas){if(e.is_dir)r.pastas++;else{r.arquivos++;if(IMAGENS.includes(extOf(e.name)))r.imagens.push(e)}}return r}
const rotuloTipo=(e,extOf)=>e.is_dir?'Pasta':(extOf(e.name)?extOf(e.name).toUpperCase():'Arquivo');
function limitarTexto(texto,max=MAX_LINHAS){const linhas=String(texto).split('\n');return linhas.length>max?{texto:linhas.slice(0,max).join('\n'),cortado:true,total:linhas.length}:{texto:String(texto),cortado:false,total:linhas.length}}
const textoPlural=(n,um,varios)=>`${n} ${n===1?um:varios}`;
const descreverPasta=r=>r.total===0?'Pasta vazia':`${textoPlural(r.total,'item','itens')} · ${textoPlural(r.pastas,'pasta','pastas')} · ${textoPlural(r.arquivos,'arquivo','arquivos')}`;
const api={IMAGENS,MAX_LINHAS,MAX_ITENS,MAX_MINIATURAS,resumoPasta,rotuloTipo,limitarTexto,descreverPasta};
if(typeof document==='undefined'){if(typeof module!=='undefined'&&module.exports)module.exports=api;return}
// ---- janela ----
// d: { win, inv, lerDoc(p,forcar), findViewer(p,doc), url(p), cfg(), saveCfg, esc, base, extOf, efetiva(p,doc), highlight, fileIcon(nome,tam,doc), folderIcon(aberta,tam), abrirNoUDS(p), flash(t) }
api.criar=d=>{const win=d.win,corpo=win.querySelector('.pv-corpo'),tit=win.querySelector('.pv-tit'),sub=win.querySelector('.pv-sub'),bAbrir=win.querySelector('.pv-abrir'),bVolta=win.querySelector('.pv-volta');
 let limpa=null,pilha=[],atual=null,seq=0,posicionada=false;
 const aberta=()=>win.style.display==='flex';
 const soltar=()=>{if(limpa){try{limpa()}catch(e){}limpa=null}};
 const msg=(h)=>{corpo.innerHTML=`<div class="wel">${h}</div>`};
 const cabecalho=(p,dir,doc,sf)=>{tit.innerHTML=`${dir?d.folderIcon(false,20):d.fileIcon(d.base(p),20,doc)} <b>${d.esc(d.base(p)||p)}</b>`;sub.textContent=sf||'';win.dataset.caminho=p;bAbrir.style.display=dir?'none':'';bVolta.style.display=pilha.length>1?'':'none'};
 const posiciona=()=>{if(posicionada)return;posicionada=true;/* encostada à direita: o explorador continua livre para o próximo clique direito */win.style.left=Math.max(10,innerWidth-win.offsetWidth-24)+'px';win.style.top='64px'};
 function fechar(){soltar();win.style.display='none';corpo.innerHTML='';pilha=[];atual=null;seq++}
 async function pasta(p,meu){let ents;try{ents=await d.inv('list_dir',{path:p})}catch(e){if(meu!==seq)return;cabecalho(p,true,null,'');return msg(`⚠ Não foi possível ler a pasta.<br>${d.esc(String(e))}`)}
  if(meu!==seq)return;const r=resumoPasta(ents,d.extOf);cabecalho(p,true,null,descreverPasta(r));
  const th=r.imagens.slice(0,MAX_MINIATURAS).map(e=>`<button class="pv-th" data-p="${d.esc(e.path)}" title="${d.esc(e.name)}"><img loading="lazy" alt="" src="${d.esc(d.url(e.path))}"><span>${d.esc(e.name)}</span></button>`).join('');
  const linhas=ents.slice(0,MAX_ITENS).map(e=>`<div class="pv-it" data-p="${d.esc(e.path)}" data-dir="${e.is_dir?1:0}" tabindex="0" role="button">${e.is_dir?d.folderIcon(false,20):d.fileIcon(e.name,20)}<span class="pv-nm">${d.esc(e.name)}</span><span class="pv-tp">${d.esc(rotuloTipo(e,d.extOf))}</span></div>`).join('');
  corpo.innerHTML=`<div class="pv-pasta">${th?`<div class="pv-ths" aria-label="Imagens da pasta">${th}</div>`:''}<div class="pv-lista">${linhas||'<div class="pad">Pasta vazia.</div>'}${ents.length>MAX_ITENS?`<div class="pad">… e mais ${ents.length-MAX_ITENS} itens.</div>`:''}</div></div>`;
  corpo.querySelectorAll('[data-p]').forEach(el=>{const ir=()=>abrir(el.dataset.p,el.dataset.dir==='1',true);el.onclick=ir;el.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();ir()}}})}
 function textoLeitura(p,doc){const ext=d.efetiva(p,doc),t=limitarTexto(doc.text);const n=t.texto.split('\n').length;
  corpo.innerHTML=`<div class="pv-txt"><div class="pv-tw" style="font-size:${d.cfg().fs||13}px"><div class="gu" aria-hidden="true">${Array.from({length:n},(_,i)=>i+1).join('<br>')}</div><pre>${d.highlight(t.texto,ext)}\n</pre></div>${t.cortado?`<div class="pad">Mostrando as primeiras ${MAX_LINHAS} de ${t.total} linhas. Abra no UDS para ver tudo.</div>`:''}</div>`}
 async function arquivo(p,meu){let doc;try{doc=await d.lerDoc(p,false)}catch(e){if(meu!==seq)return;cabecalho(p,false,null,'');return msg(`⚠ Não foi possível abrir este arquivo.<br>${d.esc(String(e))}`)}
  if(meu!==seq)return;const t=doc.det,vw=d.findViewer(p,doc),forma=t&&t.nome?t.nome:(vw?vw.nome:(doc.kind==='text'?'Texto':'Binário'));
  cabecalho(p,false,doc,`${forma} · ${(doc.size/1024).toFixed(1).replace('.',',')} KB`);
  const ehTexto=doc.kind==='text'&&!(t&&t.formato&&!t.formato.texto);
  if(ehTexto&&!vw)return textoLeitura(p,doc);
  if(vw){corpo.innerHTML='';const ctx={url:d.url,get cfg(){return d.cfg()},saveCfg:d.saveCfg,onLimpar:f=>{limpa=f},fail:m=>msg(`⚠ ${d.esc(m)}`)};
   try{return vw.open(p,doc,corpo,ctx)}catch(e){return msg(`⚠ Falha no visualizador ${d.esc(vw.nome)}: ${d.esc(e.message)}`)}}
  msg(`${d.fileIcon(d.base(p),56,doc)}<h1>${d.esc(d.base(p))}</h1>${t&&t.nome?`Formato identificado: <b>${d.esc(t.nome)}</b>${t.via==='conteudo'?' (pelo conteúdo)':''}<br>`:'Formato não reconhecido.<br>'}Ainda não há visualizador para este formato.<br>${(doc.size/1024).toFixed(1).replace('.',',')} KB<br><br><button class="pv-txtbtn">Mostrar como texto</button>`);
  const b=corpo.querySelector('.pv-txtbtn');if(b)b.onclick=async()=>{try{const f=await d.lerDoc(p,true);textoLeitura(p,f)}catch(e){msg(`⚠ ${d.esc(String(e))}`)}}}
 // abrir(caminho, éPasta, dentro): `dentro` = navegou de dentro da própria prévia (mantém o histórico para o botão Voltar)
 async function abrir(p,dir,dentro){soltar();const meu=++seq;if(!dentro)pilha=[];pilha.push({p,dir});atual={p,dir};win.style.display='flex';posiciona();msg('Carregando…');cabecalho(p,dir,null,'');
  if(dir)await pasta(p,meu);else await arquivo(p,meu);if(meu===seq)bVolta.style.display=pilha.length>1?'':'none'}
 bVolta.onclick=()=>{if(pilha.length<2)return;pilha.pop();const a=pilha.pop();abrir(a.p,a.dir,true)};
 bAbrir.onclick=()=>{if(atual&&!atual.dir){const p=atual.p;fechar();d.abrirNoUDS(p)}};
 win.querySelector('.pv-x').onclick=fechar;
 (()=>{const h=win.querySelector('.ct');let o=null;h.onpointerdown=e=>{if(e.target.closest('button'))return;o=[e.clientX-win.offsetLeft,e.clientY-win.offsetTop];h.setPointerCapture(e.pointerId)};
  h.onpointermove=e=>{if(!o)return;win.style.left=Math.min(innerWidth-80,Math.max(80-win.offsetWidth,e.clientX-o[0]))+'px';win.style.top=Math.min(innerHeight-40,Math.max(0,e.clientY-o[1]))+'px'};h.onpointerup=()=>o=null})();
 return{abrir,fechar,aberta,atual:()=>atual}};
root.UDSVisualizar=api;
})(typeof window!=='undefined'?window:globalThis);
