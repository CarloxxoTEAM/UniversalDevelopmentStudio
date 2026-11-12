// Página inicial (1.4.2): projetos recentes e a escolha da função (modo de trabalho), em uma tela só.
// Só desenha e avisa o que foi escolhido; quem abre pastas e troca de modo é o app.js (por isso é fácil de testar).
(function(root){
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const svg=p=>`<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
const PIN='<path d="M9 4h6l-1 5 3 3v2H7v-2l3-3zM12 14v6"/>';
// el: elemento que recebe a página. o: { recentes, modos, modoAtual, agora(), existe(caminho)->Promise<boolean>, tempo(agora,ts), nome(caminho),
//   mostrarAoIniciar, versao, onAbrir(rec), onModo(id), onAbrirPasta(), onAbrirArquivo(), onFixar(rec), onRemover(rec), onMostrarAoIniciar(bool), onFechar() }
function montar(el,o){
 const rec=o.recentes||[],agora=o.agora?o.agora():Date.now();let sel=rec.length?0:-1,vivo=true;
 const linha=(r,i)=>{const m=o.modos.find(x=>x.id===r.modo);const tempo=o.tempo?o.tempo(agora,r.ultimoUso):'';
  return`<div class="in-it${i===sel?' on':''}" role="option" aria-selected="${i===sel}" data-i="${i}" tabindex="-1" title="${esc(r.caminho)}">
   <span class="in-mi" title="Modo ${esc(m?m.nome:r.modo)}">${svg(m?m.icone:'')}</span>
   <span class="in-tx"><b>${esc(o.nome?o.nome(r.caminho):r.caminho)}</b><small>${esc(r.caminho)}</small></span>
   <span class="in-tm">${esc(tempo)}</span>
   <button class="in-pin${r.fixado?' on':''}" data-pin="${i}" aria-label="${r.fixado?'Desafixar':'Fixar'} ${esc(o.nome?o.nome(r.caminho):r.caminho)}" aria-pressed="${!!r.fixado}" title="${r.fixado?'Desafixar':'Fixar na lista'}">${svg(PIN)}</button></div>`};
 const cartao=m=>{const off=m.disponivel===false;return`<button class="in-card${m.id===o.modoAtual?' on':''}${off?' off':''}" data-modo="${esc(m.id)}"${off?' aria-disabled="true"':''} title="${esc(m.nome)} (Ctrl+${esc(m.atalho||'')})">
   <span class="in-ci">${svg(m.icone)}</span><b>${esc(m.nome)}</b><small>${off?`Em breve (versão ${esc(m.previsto||'')})`:esc(m.desc||'')}</small><kbd>Ctrl+${esc(m.atalho||'')}</kbd></button>`};
 el.innerHTML=`<div class="in-col">
  <header class="in-cab"><img src="logo.png" width="52" height="52" alt=""><div><h1>Universal Development Studio</h1><p>One Studio. Unlimited Possibilities.</p></div><span class="sp"></span><span class="in-ver">${esc(o.versao?'Versão '+o.versao:'')}</span></header>
  <div class="in-grid">
   <section class="in-rec" aria-labelledby="in-h1"><h2 id="in-h1">Projetos recentes</h2>
    <div class="in-lista" role="listbox" aria-label="Projetos recentes" tabindex="0">${rec.length?rec.map(linha).join(''):'<div class="in-vazio">Nenhum projeto ainda.<br>Abra uma pasta para ela aparecer aqui.</div>'}</div></section>
   <section class="in-fun" aria-labelledby="in-h2"><h2 id="in-h2">Escolha a função</h2>
    <div class="in-cards">${o.modos.map(cartao).join('')}</div>
    <div class="in-btns"><button class="gb" data-a="pasta">Abrir pasta…</button><button data-a="arquivo">Abrir arquivo…</button></div></section>
  </div>
  <footer class="in-rod"><label><input type="checkbox" id="in-ini"${o.mostrarAoIniciar!==false?' checked':''}> Mostrar esta página ao iniciar</label><span class="sp"></span><span>↑ ↓ e Enter abrem um projeto · Ctrl+1 a Ctrl+4 escolhem a função · Esc fecha</span></footer></div>`;
 const lista=el.querySelector('.in-lista'),itens=[...el.querySelectorAll('.in-it')];
 const marca=i=>{sel=Math.max(-1,Math.min(rec.length-1,i));itens.forEach((e,k)=>{e.classList.toggle('on',k===sel);e.setAttribute('aria-selected',k===sel)});if(itens[sel])itens[sel].scrollIntoView({block:'nearest'})};
 itens.forEach((e,i)=>{e.onclick=ev=>{if(ev.target.closest('[data-pin]'))return;marca(i);o.onAbrir(rec[i])};
  e.oncontextmenu=ev=>{ev.preventDefault();marca(i);o.onMenu&&o.onMenu(rec[i],ev.clientX,ev.clientY)};
  e.querySelector('[data-pin]').onclick=ev=>{ev.stopPropagation();o.onFixar(rec[i])}});
 el.querySelectorAll('[data-modo]').forEach(b=>b.onclick=()=>o.onModo(b.dataset.modo));
 el.querySelector('[data-a="pasta"]').onclick=()=>o.onAbrirPasta();el.querySelector('[data-a="arquivo"]').onclick=()=>o.onAbrirArquivo();
 el.querySelector('#in-ini').onchange=e=>o.onMostrarAoIniciar&&o.onMostrarAoIniciar(e.target.checked);
 el.onkeydown=e=>{if(e.target.matches('input'))return;const k=e.key;
  if(k==='ArrowDown'){e.preventDefault();marca(sel+1)}else if(k==='ArrowUp'){e.preventDefault();marca(sel<=0?0:sel-1)}
  else if(k==='Enter'&&rec[sel]){e.preventDefault();o.onAbrir(rec[sel])}else if(k==='Delete'&&rec[sel]){e.preventDefault();o.onRemover(rec[sel])}
  else if((k==='p'||k==='P')&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&rec[sel]){e.preventDefault();o.onFixar(rec[sel])}};
 // pastas que não existem mais ficam esmaecidas (a checagem roda em segundo plano e nunca trava a tela)
 if(o.existe)rec.forEach((r,i)=>{Promise.resolve().then(()=>o.existe(r.caminho)).then(ok=>{if(!vivo||ok!==false)return;const e=itens[i];if(!e)return;e.classList.add('ausente');e.querySelector('small').textContent='Pasta não encontrada · '+r.caminho}).catch(()=>{})});
 lista.focus({preventScroll:true});
 return{marca,selecionado:()=>rec[sel]||null,destruir(){vivo=false;el.onkeydown=null;el.innerHTML=''}}}
const api={montar};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.UDSInicio=api;
})(typeof window!=='undefined'?window:globalThis);
