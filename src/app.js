// Interface do UDS (Fundação). Fala com o núcleo Rust (src-tauri/src/main.rs) via invoke().
if(!window.__TAURI__){document.body.innerHTML='<p style="padding:20px">Abra o UDS pelo executável UniversalDevelopmentStudio.</p>';throw new Error('sem Tauri')}
const T=window.__TAURI__,$=s=>document.querySelector(s);
const {esc,base,par,join,extOf,langOf,iconPath,iconPathByName,folderPath,CATEGORIAS,listarTipos,iconColor,ESTILOS,highlight,lerTema,cssVars,temaModo,TEMAS_EMBUTIDOS,THEME_KEYS}=UDSCore;
const inv=(c,a)=>T.core.invoke(c,a),url=p=>T.core.convertFileSrc(p);
const VERSION='1.4.1';
UDSLoading.versao(VERSION);
let themes=[],themesDir='',root=null,cfg={theme:'dark',themeId:'uds-escuro',iconStyle:'estilo1',recent:[],fs:13,zoom:1,notes:{},activeNote:{},sideOpen:true,panelOpen:true,notesOpen:true},docs={},tabs=[],active=null,dirs={},openD={},side='exp',sec={opened:false,proj:true,outline:false,timeline:false},ptab='term',buf={term:'',prob:'',out:'',dbg:''};
const IC={folder:'<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',git:'<circle cx="6" cy="5" r="2.2"/><circle cx="6" cy="19" r="2.2"/><circle cx="18" cy="8" r="2.2"/><path d="M6 7.2v9.6M18 10.2c0 4-6 3-12 6"/>',play:'<path d="M7 4.5v15l12-7.5z"/>',plug:'<path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4"/>',gear:'<path d=\"M19.06 10.56 L21.54 10.91 L21.54 13.09 L19.06 13.44 L18.65 14.76 L18.00 15.97 L19.51 17.98 L17.98 19.51 L15.97 18.00 L14.76 18.65 L13.44 19.06 L13.09 21.54 L10.91 21.54 L10.56 19.06 L9.24 18.65 L8.03 18.00 L6.02 19.51 L4.49 17.98 L6.00 15.97 L5.35 14.76 L4.94 13.44 L2.46 13.09 L2.46 10.91 L4.94 10.56 L5.35 9.24 L6.00 8.03 L4.49 6.02 L6.02 4.49 L8.03 6.00 L9.24 5.35 L10.56 4.94 L10.91 2.46 L13.09 2.46 L13.44 4.94 L14.76 5.35 L15.97 6.00 L17.98 4.49 L19.51 6.02 L18.00 8.03 L18.65 9.24Z\"/><circle cx=\"12\" cy=\"12\" r=\"3.2\"/>',l1:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/>',l2:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 15h18"/>',l3:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/>',chev:'<path d="m6 9 6 6 6-6"/>'};
const svg=n=>`<svg class="i" viewBox="0 0 24 24">${IC[n]}</svg>`;
const log=t=>{buf.out+=esc(t)+'\n';if(ptab=='out')showPanel()};
const flash=t=>{$('#s2').textContent=t;setTimeout(()=>{if($('#s2').textContent==t)$('#s2').textContent=''},2500)};
const saveCfg=()=>inv('save_config',{json:JSON.stringify(cfg)}).catch(()=>{});
const fileIcon=(n,sz,d)=>{const i=d&&d.det&&d.det.icone;const src=i?iconPathByName(i,cfg.iconStyle,iconColor(cfg.theme)):iconPath(n,cfg.iconStyle,iconColor(cfg.theme));return`<img class="fi" alt="" src="${src}"${sz?` width="${sz}" height="${sz}"`:''}>`};
const folderIcon=(open,sz)=>`<img class="fi" alt="" src="${folderPath(open,cfg.iconStyle,iconColor(cfg.theme))}"${sz?` width="${sz}" height="${sz}"`:''}>`;
function ask(l,v=''){return new Promise(r=>{const m=$('#mod'),i=$('#mi');$('#ml').textContent=l;i.value=v;m.style.display='grid';i.focus();i.select();const done=x=>{m.style.display='none';i.onkeydown=null;r(x)};i.onkeydown=e=>{if(e.key=='Enter')done(i.value.trim());if(e.key=='Escape')done(null)}})}

/* ---------- Zoom e layout (0.40) ---------- */
function setZoom(z){z=Math.min(3,Math.max(.5,Math.round(z*100)/100));cfg.zoom=z;const a=$('#app');a.style.zoom=z;a.style.width=`calc(100vw / ${z})`;a.style.height=`calc(100vh / ${z})`;$('#zl').textContent=Math.round(z*100)+'%';saveCfg()}
function applyLayout(){$('#side').style.display=cfg.sideOpen?'':'none';$('#panel').style.display=cfg.panelOpen?'':'none';$('#notes').style.display=cfg.notesOpen?'':'none';[['t1','sideOpen'],['t2','panelOpen'],['t3','notesOpen']].forEach(([id,k])=>$('#'+id).classList.toggle('on',cfg[k]));renderNotes()}
const toggle=k=>{cfg[k]=!cfg[k];applyLayout();saveCfg()};
/* ---------- Temas (1.10): themes/<pasta>/theme.json ---------- */
async function loadThemes(){const lista=[],ids=new Set();
 try{themesDir=await inv('themes_path');const ents=await inv('list_dir',{path:themesDir});
  for(const e of ents.filter(x=>x.is_dir)){const f=join(e.path,'theme.json');let r;try{r=await inv('read_file',{path:f,forceText:true})}catch(x){continue}
   const v=lerTema(r.text);if(!v.ok){log(`Tema "${e.name}" ignorado: ${v.erro}`);continue}
   if(v.tema.id!==e.name){log(`Tema "${e.name}" ignorado: o "id" (${v.tema.id}) precisa ser igual ao nome da pasta`);continue}
   v.avisos.forEach(a=>log(`Tema "${e.name}": ${a}`));ids.add(v.tema.id);lista.push(v.tema)}}
 catch(e){log('Pasta de temas indisponível; usando os temas internos.')}
 TEMAS_EMBUTIDOS.forEach(t=>{if(!ids.has(t.id))lista.push(t)});themes=lista}
function applyTheme(id,salvar=true){let t=themes.find(x=>x.id==id);if(!t){log(`Tema "${id}" não encontrado; usando o padrão.`);t=themes.find(x=>x.id=='uds-escuro')}
 const el=document.documentElement;Object.values(THEME_KEYS).forEach(v=>el.style.removeProperty(v));Object.entries(cssVars(t)).forEach(([k,v])=>el.style.setProperty(k,v));
 cfg.themeId=t.id;cfg.theme=temaModo(t);el.dataset.theme=cfg.theme;if(salvar)saveCfg();renderAll()}
const setThemeId=id=>applyTheme(id);
function toggleTheme(){const atual=themes.find(x=>x.id==cfg.themeId);applyTheme(atual&&atual.tipo=='claro'?'uds-escuro':'uds-claro')}
async function reloadThemes(){await loadThemes();applyTheme(cfg.themeId,false);log(`${themes.length} tema(s) carregado(s).`)}

/* ---------- Menus ---------- */
const MENU=[['PROGRAMA',[['Configurações…','Ctrl+,',()=>abrirConfig('aparencia')],['Tipos de arquivo…','',()=>abrirConfig('tipos')],['Sobre o UDS','',()=>abrirConfig('sobre')]]],
['ARQUIVO',[['Abrir pasta…','Ctrl+O',openFolder],['Abrir arquivo…','',openFile],['Novo arquivo','',()=>mk(root,false)],['Nova pasta','',()=>mk(root,true)],['Salvar','Ctrl+S',saveAll],['Reabrir como texto','',()=>reopen(active)],['Fechar aba','',()=>closeTab(active)]]],
['EXIBIR',[['Alternar tema claro/escuro','',toggleTheme],['Recarregar temas','',reloadThemes],['Abrir pasta de temas','',abrirPastaTemas],['Barra lateral','',()=>toggle('sideOpen')],['Painel inferior','',()=>toggle('panelOpen')],['Notas','',()=>toggle('notesOpen')],['Aumentar zoom','Ctrl +',()=>setZoom(cfg.zoom+.1)],['Diminuir zoom','Ctrl -',()=>setZoom(cfg.zoom-.1)],['Zoom padrão','Ctrl 0',()=>setZoom(1)]]],
];
function popup(el,x,y,items){el.innerHTML='';items.forEach(it=>{const d=document.createElement('div');if(it.gt){d.className='gt';d.textContent=it.gt}else{d.innerHTML=`<span>${it.h||esc(it.t)}</span><small>${esc(it.k||'')}</small>`;d.onclick=()=>{hideMenus();it.f()}}el.appendChild(d)});el.style.left=Math.min(x,innerWidth-240)+'px';el.style.top=y+'px';el.style.display='block'}
function hideMenus(){$('#drop').style.display='none';$('#ctx').style.display='none'}
document.addEventListener('click',hideMenus);
$('#logo').onclick=e=>{e.stopPropagation();const it=[];MENU.forEach(([g,l])=>{it.push({gt:g});l.forEach(([t,k,f])=>it.push({t,k,f}))});popup($('#drop'),12,44,it)};
$('#proj').onclick=e=>{e.stopPropagation();const it=[{t:'Abrir pasta…',k:'Ctrl+O',f:openFolder}];if(cfg.recent.length)it.push({gt:'RECENTES'});cfg.recent.forEach(r=>it.push({t:r,f:()=>setRoot(r).catch(x=>log('Erro: '+x))}));popup($('#drop'),$('#proj').getBoundingClientRect().left,44,it)};

/* ---------- Pastas e arquivos (0.10 e 0.20) ---------- */
async function loadDir(p){dirs[p]=await inv('list_dir',{path:p})}
async function setRoot(p){const lista=await inv('list_dir',{path:p});root=p;dirs={};dirs[p]=lista;openD={};docs={};tabs=[];active=null;side='exp';cfg.sideOpen=true;cfg.recent=[p,...cfg.recent.filter(x=>x!=p)].slice(0,8);saveCfg();applyLayout();renderAll();log('Pasta aberta: '+p)}
async function openFolder(){const p=await T.dialog.open({directory:true});if(p)setRoot(p).catch(e=>log('Erro: '+e))}
async function openFile(){const p=await T.dialog.open({multiple:false});if(p)openF(p)}
async function toggleDir(d){if(openD[d])delete openD[d];else{try{await loadDir(d);openD[d]=1}catch(e){log('Erro: '+e)}}renderSide()}
async function refresh(){for(const k of Object.keys(dirs)){try{await loadDir(k)}catch(e){delete dirs[k]}}renderSide()}
async function mk(dir,isDir){if(!root)return flash('Abra uma pasta primeiro.');dir=dir||root;const n=await ask(isDir?'Nome da nova pasta:':'Nome do novo arquivo:');if(!n)return;const p=join(dir,n);try{await inv(isDir?'create_dir':'write_file',isDir?{path:p}:{path:p,content:''});if(!dirs[dir])await loadDir(dir);openD[dir]=1;await refresh();if(!isDir)openF(p)}catch(e){log('Erro: '+e)}}
async function ren(p){const n=await ask('Novo nome:',base(p));if(!n||n==base(p))return;try{await inv('rename_path',{from:p,to:join(par(p),n)});tabs.filter(t=>t==p||t.startsWith(p+'/')||t.startsWith(p+'\\')).forEach(t=>dropTab(t));await refresh()}catch(e){log('Erro: '+e)}}
async function del(p){if(await ask(`Excluir "${base(p)}"? Digite sim para confirmar.`)!='sim')return;try{await inv('delete_path',{path:p});tabs.filter(t=>t==p||t.startsWith(p+'/')||t.startsWith(p+'\\')).forEach(t=>dropTab(t));await refresh()}catch(e){log('Erro: '+e)}}
const lerDoc=async(p,forcar)=>{const r=await inv('read_file',{path:p,forceText:forcar});const d={...r,dirty:false,forced:forcar};d.det=UDSDeteccao.identificar({nome:base(p),head:r.head,texto:r.kind=='text'?r.text:null});return d};
async function openF(p){if(!docs[p]){try{docs[p]=await lerDoc(p,false)}catch(e){log('Erro: '+e);flash('Erro ao abrir: '+base(p));return}}if(!tabs.includes(p))tabs.push(p);active=p;renderAll()}
async function reopen(p){if(!p)return;try{docs[p]=await lerDoc(p,true);renderAll()}catch(e){log('Erro: '+e)}}
async function saveAll(){let n=0,reload=false;for(const p of tabs){const d=docs[p];if(d&&d.dirty&&d.kind=='text'){try{await inv('write_file',{path:p,content:d.text});d.dirty=false;n++;if(themesDir&&p.startsWith(themesDir)&&base(p)=='theme.json')reload=true}catch(e){log('Erro ao salvar '+base(p)+': '+e)}}}renderTabs();renderSide();if(n){log(`${n} arquivo(s) salvo(s).`);flash('Salvo.')}if(reload)reloadThemes()}
function dropTab(p){tabs=tabs.filter(t=>t!=p);delete docs[p];if(active==p)active=tabs[tabs.length-1]||null;renderAll()}
async function closeTab(p){if(!p)return;const d=docs[p];if(d&&d.dirty){const r=await ask(`"${base(p)}" tem alterações. Digite s para salvar ou n para descartar:`);if(r===null)return;if(r.toLowerCase()=='s')await saveAll()}dropTab(p)}

/* ---------- Barra lateral ---------- */
const RAIL=[['exp','folder','Explorer'],['search','search','Busca no projeto (versão 2.10)',1],['git','git','Git (versão 3.00)',1],['run','play','Execução de scripts (versão 2.60)',1],['ext','plug','Extensões (versão 7.00)',1]];
function renderRail(){const a=$('#act');a.innerHTML='';RAIL.forEach(([id,ic,t,off])=>{const b=document.createElement('button');b.innerHTML=svg(ic);b.title=t;b.setAttribute('aria-label',t);if(off)b.style.opacity=.35;b.classList.toggle('on',side==id);b.onclick=()=>{if(off)return flash(t);side=id;cfg.sideOpen=true;applyLayout();renderRail();renderSide()};a.appendChild(b)});
 const s=document.createElement('div');s.className='sp';a.appendChild(s);const g=document.createElement('button');g.innerHTML=svg('gear');g.title='Configurações';g.setAttribute('aria-label','Configurações');g.onclick=()=>abrirConfig();a.appendChild(g)}
function tree(p,d){return(dirs[p]||[]).map(e=>{const pad=`style="padding-left:${8+d*12}px"`;if(e.is_dir){const o=openD[e.path];return`<div class="it" ${pad} data-d="${esc(e.path)}"><span class="ch">${o?'⌄':'›'}</span>${folderIcon(!!o)} ${esc(e.name)}</div>`+(o?tree(e.path,d+1):'')}return`<div class="it ${active==e.path?'on':''}" ${pad} data-p="${esc(e.path)}"><span class="ch"></span>${fileIcon(e.name,undefined,docs[e.path])} ${esc(e.name)}${docs[e.path]&&docs[e.path].dirty?' ●':''}</div>`}).join('')}
const shd=(k,t,extra='')=>`<div class="sh" data-s="${k}"><span>${sec[k]?'⌄':'›'}</span>${t}<span class="sp"></span>${extra}</div>`;
function renderSide(){const s=$('#side');
 
 let h='<div class="eh">EXPLORER<span class="sp"></span><span style="cursor:pointer" id="mo" title="Ações">⋯</span></div><div class="sc">';
 h+=shd('opened','OPENED EDITORS');if(sec.opened)h+=tabs.map(t=>`<div class="it ${active==t?'on':''}" data-p="${esc(t)}" style="padding-left:22px">${fileIcon(t,undefined,docs[t])} ${esc(base(t))}</div>`).join('')||'<div class="pad">Nenhum arquivo aberto.</div>';
 h+=root?shd('proj',esc(base(root).toUpperCase())):shd('proj','PROJETO');
 if(sec.proj)h+=root?tree(root,0):'<div class="pad">Nenhuma pasta aberta.<br><br><button id="of">Abrir pasta</button></div>';
 h+='</div>'+shd('outline','OUTLINE')+(sec.outline?'<div class="pad">Estrutura do arquivo: em breve.</div>':'')+shd('timeline','TIMELINE')+(sec.timeline?'<div class="pad">Histórico do arquivo: Git, versão 3.00.</div>':'');
 s.innerHTML=h;s.querySelectorAll('[data-p]').forEach(e=>e.onclick=()=>openF(e.dataset.p));s.querySelectorAll('[data-d]').forEach(e=>e.onclick=()=>toggleDir(e.dataset.d));
 s.querySelectorAll('[data-s]').forEach(e=>e.onclick=()=>{sec[e.dataset.s]=!sec[e.dataset.s];renderSide()});const of=$('#of');if(of)of.onclick=openFolder;
 $('#mo').onclick=e=>{e.stopPropagation();popup($('#ctx'),e.clientX-150,e.clientY+10,[{t:'Novo arquivo',f:()=>mk(root,false)},{t:'Nova pasta',f:()=>mk(root,true)},{t:'Atualizar',f:refresh}])}}
$('#side').oncontextmenu=e=>{e.preventDefault();if(side!='exp'||!root)return;const t=e.target.closest('[data-p],[data-d]'),p=t&&(t.dataset.p||t.dataset.d),dir=!t?root:t.dataset.d||par(p);const it=[{t:'Novo arquivo',f:()=>mk(dir,false)},{t:'Nova pasta',f:()=>mk(dir,true)}];if(p)it.push({t:'Renomear',f:()=>ren(p)},{t:'Excluir',f:()=>del(p)});popup($('#ctx'),e.clientX,e.clientY,it)};

/* ---------- Abas e cabeçalho ---------- */
function renderTabs(){const t=$('#tabs');t.innerHTML='';tabs.forEach(p=>{const d=document.createElement('div');d.className='tab'+(p==active?' on':'');d.innerHTML=`${fileIcon(p,undefined,docs[p])} ${esc(base(p))}${docs[p]&&docs[p].dirty?' ●':''}<i title="Fechar">✕</i>`;d.onclick=()=>openF(p);d.querySelector('i').onclick=e=>{e.stopPropagation();closeTab(p)};t.appendChild(d)});const pl=document.createElement('div');pl.className='plus';pl.textContent='+';pl.title='Novo arquivo';pl.onclick=()=>mk(root,false);t.appendChild(pl)}
function renderTop(){$('#proj').innerHTML=`<span>${esc(root?base(root):'Abrir pasta')}</span>${svg('chev')}`;let c='';if(root){const rel=active&&active.startsWith(root)?active.slice(root.length+1).split(/[\\/]/):[];c=rel.length?'/ '+rel.slice(0,-1).map(esc).join(' › ')+(rel.length>1?' › ':'')+`<b>${esc(rel[rel.length-1])}</b>`:''}else if(active)c=`<b>${esc(base(active))}</b>`;$('#crumb').innerHTML=c;
 $('#t1').innerHTML=svg('l1');$('#t2').innerHTML=svg('l2');$('#t3').innerHTML=svg('l3');$('#si').innerHTML=svg('search')}

/* ---------- Área central ---------- */
function welcome(){const v=$('#view');v.innerHTML=`<div class="wel"><img src="logo.png" width="64" height="64" alt=""><h1>Universal Development Studio</h1>One Studio. Unlimited Possibilities.<br><br><button data-a="of">Abrir pasta</button> <button data-a="ofi">Abrir arquivo</button><br><br>${cfg.recent.length?'Projetos recentes':''}${cfg.recent.map(r=>`<div><a href="#" data-r="${esc(r)}" style="color:var(--ac)">${esc(r)}</a></div>`).join('')}</div>`;
 v.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>b.dataset.a=='of'?openFolder():openFile());v.querySelectorAll('[data-r]').forEach(a=>a.onclick=e=>{e.preventDefault();setRoot(a.dataset.r).catch(x=>log('Erro: '+x))})}
let limpaView=null;
const ctx={url,get cfg(){return cfg},saveCfg,onLimpar:f=>{limpaView=f},fail:m=>{$('#view').innerHTML=`<div class="wel">⚠ ${esc(m)}<br><button id="rt">Abrir como texto</button></div>`;$('#rt').onclick=()=>reopen(active)}};
// tipo mostrado na barra de status: nome + origem da identificação + aviso se a extensão não combina com o conteúdo
const efetiva=(p,d)=>(d.det&&d.det.ext)||extOf(p);
function statusTipo(p,d,rotulo){const t=d.det;let x=t&&t.via=='conteudo'&&t.nome?t.nome:rotulo;if(t&&t.via=='conteudo')x+=' · pelo conteúdo';if(t&&t.conflito)x+=` · ⚠ a extensão .${t.extArquivo} não combina com o conteúdo (${t.nome})`;return x}
const binDet=d=>!!(d.det&&d.det.formato&&!d.det.formato.texto);
function view(){if(limpaView){try{limpaView()}catch(e){}limpaView=null}const v=$('#view');v.innerHTML='';$('#s3').textContent='';$('#s2').textContent='';if(!active)return welcome();const p=active,d=docs[p];
 if(d.forced||d.kind=='text'&&!binDet(d)&&!UDS.findViewer(p,d)){$('#s3').textContent=statusTipo(p,d,langOf('x.'+efetiva(p,d)));return editor(p)}
 const vw=UDS.findViewer(p,d);if(vw){$('#s3').textContent=statusTipo(p,d,vw.nome);try{return vw.open(p,d,v,ctx)}catch(e){return ctx.fail('Falha no visualizador '+vw.nome+': '+e.message)}}
 const t=d.det,prev=t&&t.vis?`O visualizador está previsto para a etapa ${t.vis}.`:'Ainda não há visualizador para este formato.';$('#s3').textContent=statusTipo(p,d,t&&t.nome?t.nome:'Binário');
 v.innerHTML=`<div class="wel">${fileIcon(p,56,d)}<h1>${esc(base(p))}</h1>${t&&t.nome?`Formato identificado: <b>${esc(t.nome)}</b>${t.via=='conteudo'?' (pelo conteúdo)':''}<br>`:'Formato não reconhecido.<br>'}${t&&t.conflito?`⚠ A extensão <b>.${esc(t.extArquivo)}</b> não combina com o conteúdo.<br>`:''}${prev}<br>${(d.size/1024).toFixed(1)} KB<br><br><button id="rt">Abrir como texto</button></div>`;$('#rt').onclick=()=>reopen(p)}
function editor(p){const v=$('#view'),d=docs[p],ext=efetiva(p,d);v.innerHTML='<div class="ed"><div class="gu"></div><div class="al"></div><pre></pre><textarea spellcheck="false" wrap="off" aria-label="Editor"></textarea></div>';const ed=v.querySelector('.ed');ed.style.fontSize=cfg.fs+'px';
 const ta=ed.querySelector('textarea'),pre=ed.querySelector('pre'),gu=ed.querySelector('.gu'),al=ed.querySelector('.al');ta.value=d.text;
 const up=()=>{pre.innerHTML=highlight(ta.value,ext)+'\n';gu.innerHTML=Array.from({length:ta.value.split('\n').length},(_,i)=>i+1).join('<br>')};
 const lh=()=>parseFloat(getComputedStyle(ta).lineHeight)||20;
 const cur=()=>{const a=ta.value.slice(0,ta.selectionStart).split('\n');$('#s2').textContent=`Ln ${a.length}, Col ${a[a.length-1].length+1}`;al.style.top=(8+(a.length-1)*lh()-ta.scrollTop)+'px';al.style.height=lh()+'px'};
 ta.oninput=()=>{d.text=ta.value;if(!d.dirty){d.dirty=true;renderTabs();renderSide()}up();cur()};
 ta.onscroll=()=>{pre.style.transform=`translate(${-ta.scrollLeft}px,${-ta.scrollTop}px)`;gu.style.transform=`translateY(${-ta.scrollTop}px)`;cur()};
 ta.onkeyup=ta.onclick=cur;ta.onkeydown=e=>{if(e.key=='Tab'){e.preventDefault();document.execCommand('insertText',false,'  ')}};up();cur();ta.focus()}

/* ---------- Notas ---------- */
const nkey=()=>root||'_global',NC=['#2f6df0','#ffb13b','#6bd968','#c586c0','#ff6b6b','#35b7a3'];let nTimer=0;
function renderNotes(){const n=$('#notes');if(!cfg.notesOpen)return;const k=nkey(),L=cfg.notes[k]||(cfg.notes[k]=[]);const cur=L.find(x=>x.id==cfg.activeNote[k])||L[0];
 n.innerHTML=`<div id="nh"><b>Notas</b><span class="badge">${L.length}</span><span class="sp"></span><button class="gb" id="nn">＋ Nova nota</button><button id="nx" style="border:0" title="Fechar">✕</button></div><div id="nt"></div><div id="nb"></div><div id="nf"></div>`;
 L.forEach((x,i)=>{const d=document.createElement('div');d.textContent=x.title;d.style.setProperty('--dot',NC[i%6]);d.className=x==cur?'on':'';d.title='Duplo clique para renomear';d.onclick=()=>{cfg.activeNote[k]=x.id;renderNotes()};d.ondblclick=async()=>{const t=await ask('Título da nota:',x.title);if(t){x.title=t;saveCfg();renderNotes()}};$('#nt').appendChild(d)});
 if(cur){$('#nb').innerHTML='<textarea placeholder="Escreva suas anotações aqui… Elas ficam salvas neste projeto." aria-label="Nota"></textarea>';const ta=$('#nb textarea');ta.value=cur.text;ta.oninput=()=>{cur.text=ta.value;clearTimeout(nTimer);nTimer=setTimeout(saveCfg,400)};
  const f=$('#nf');(cur.links||[]).forEach(l=>{const b=document.createElement('button');b.className='lk';b.textContent='@'+base(l);b.title=l;b.onclick=()=>openF(l);b.oncontextmenu=e=>{e.preventDefault();cur.links=cur.links.filter(x=>x!=l);saveCfg();renderNotes()};f.appendChild(b)});
  const a=document.createElement('button');a.textContent='＋ Vincular arquivo atual';a.onclick=()=>{if(!active)return flash('Abra um arquivo para vincular.');cur.links=[...new Set([...(cur.links||[]),active])];saveCfg();renderNotes()};f.appendChild(a);
  const x=document.createElement('button');x.textContent='Excluir nota';x.onclick=async()=>{if(await ask('Excluir esta nota? Digite sim:')=='sim'){cfg.notes[k]=L.filter(y=>y!=cur);saveCfg();renderNotes()}};f.appendChild(x)}
 else $('#nb').innerHTML='<div class="pad">Nenhuma nota ainda. Clique em “Nova nota” para começar.</div>';
 $('#nn').onclick=async()=>{const t=await ask('Título da nova nota:','Nota '+(L.length+1));if(!t)return;const o={id:Date.now(),title:t,text:'',links:[]};L.push(o);cfg.activeNote[k]=o.id;saveCfg();renderNotes()};$('#nx').onclick=()=>toggle('notesOpen')}

/* ---------- Painel inferior ---------- */
const PT=[['term','Terminal'],['prob','Problems'],['out','Output'],['dbg','Debug']];
const TERM='<span class="pr">uds@portable</span> <span class="pa">~</span> <span class="br">(fundação)</span> $ O terminal integrado chega na versão 2.50.\nAs mensagens do UDS aparecem na aba Output.';
function setPtab(t){ptab=t;showPanel()}
function showPanel(){const pt=$('#ptabs');pt.innerHTML='';PT.forEach(([k,n])=>{const s=document.createElement('span');s.className='t1'+(k==ptab?' on':'');s.textContent=n;s.onclick=()=>setPtab(k);pt.appendChild(s)});
 $('#out').innerHTML=ptab=='term'?TERM:buf[ptab]||'<span style="color:var(--tx2)">Nada por aqui ainda.</span>';$('#out').scrollTop=1e9;$('#pr').innerHTML='<span class="pr">uds@portable</span> $';const ci=$('#ci');ci.disabled=true;ci.placeholder='Terminal: versão 2.50'}


/* ---------- Configurações: caixa flutuante ---------- */
const CFG_ABAS=[['aparencia','Aparência'],['editor','Editor'],['tipos','Tipos de arquivo'],['atalhos','Atalhos'],['extensoes','Extensões'],['sobre','Sobre']];
let cfgAba='aparencia',cfgFiltro='';
const cfgAberta=()=>$('#cfgwin').style.display=='flex';
function abrirConfig(aba){if(aba)cfgAba=aba;const w=$('#cfgwin'),nova=!cfgAberta();w.style.display='flex';if(nova){w.style.left=Math.max(10,(innerWidth-w.offsetWidth)/2)+'px';w.style.top='64px'}renderConfig()}
function fecharConfig(){$('#cfgwin').style.display='none'}
async function abrirPastaTemas(){if(!themesDir){flash('Pasta de temas não encontrada.');log('Pasta de temas não encontrada: ela precisa ficar ao lado do UniversalDevelopmentStudio.exe.');setPtab('out');return}
 try{await setRoot(themesDir);fecharConfig()}catch(e){log('Erro ao abrir a pasta de temas ('+themesDir+'): '+e);flash('Não foi possível abrir a pasta de temas.');setPtab('out')}}
function listaTiposHtml(){const f=cfgFiltro.toLowerCase().replace(/^\./,'');let h='',cat='',n=0;
 for(const t of listarTipos()){if(f&&!t.nome.includes(f)&&!t.exts.some(e=>e.includes(f)))continue;n++;
  if(t.cat!==cat){cat=t.cat;h+=`<div class="cat">${esc(CATEGORIAS[cat]||cat)}</div>`}
  h+=`<div class="tr"><img class="fi" alt="" src="${iconPathByName(t.nome,cfg.iconStyle,iconColor(cfg.theme))}"><b>${esc(t.nome)}</b><span>${t.exts.length?'('+t.exts.map(e=>'.'+esc(e)).join(', ')+')':'(identificado pelo conteúdo)'}</span></div>`}
 return n?h:'<div class="hint">Nenhum tipo encontrado.</div>'}
function renderConfig(){const nav=$('#cfgnav');nav.innerHTML='';
 CFG_ABAS.forEach(([k,n])=>{const d=document.createElement('div');d.textContent=n;d.className=k==cfgAba?'on':'';d.onclick=()=>{cfgAba=k;renderConfig()};nav.appendChild(d)});
 const b=$('#cfgbody');
 if(cfgAba=='aparencia'){
  b.innerHTML=`<h3>Tema</h3><div class="ln"><select id="th">${themes.map(t=>`<option value="${esc(t.id)}">${esc(t.nome)} (${t.tipo})</option>`).join('')}</select><button id="tr">Recarregar</button><button id="to">Abrir pasta de temas</button></div><div class="hint">Para criar o seu, siga <b>themes/COMO-CRIAR-UM-TEMA.md</b>. Ao salvar um theme.json aberto aqui no UDS, as cores mudam na hora.<br>Pasta de temas: ${esc(themesDir||'não encontrada')}</div>
   <h3>Estilo dos ícones de arquivo</h3><select id="is">${ESTILOS.map(k=>`<option value="${k}">${esc(UDSIconIndex.estilos[k])}</option>`).join('')}</select>
   <h3>Zoom da interface: ${Math.round(cfg.zoom*100)}%</h3><div class="ln"><button id="z1">−</button><button id="z2">＋</button><button id="z0">100%</button></div><div class="hint">Atalhos: Ctrl +, Ctrl − e Ctrl 0.</div>
   <h3>Tela de loading</h3><label class="ln"><input type="checkbox" id="ld"> Mostrar ao iniciar</label><div class="hint">Painel de abertura com o que está sendo carregado. Também some com um clique ou com Esc.</div>
    <h3>Restaurar</h3><button id="rs">Restaurar padrões</button><div class="hint">Volta ao tema UDS Escuro, ícones do Estilo 1, fonte 13 e zoom 100%.</div>`;
  $('#th').value=cfg.themeId;$('#is').value=cfg.iconStyle;$('#th').onchange=e=>setThemeId(e.target.value);$('#tr').onclick=()=>reloadThemes();$('#to').onclick=abrirPastaTemas;
  $('#ld').checked=cfg.mostrarLoading!==false;$('#ld').onchange=e=>{cfg.mostrarLoading=e.target.checked;UDSLoading.preferencia(cfg.mostrarLoading);saveCfg()};
   $('#is').onchange=e=>{cfg.iconStyle=e.target.value;saveCfg();renderAll()};
  $('#z1').onclick=()=>{setZoom(cfg.zoom-.1);renderConfig()};$('#z2').onclick=()=>{setZoom(cfg.zoom+.1);renderConfig()};$('#z0').onclick=()=>{setZoom(1);renderConfig()};
  $('#rs').onclick=()=>{cfg.iconStyle='estilo1';cfg.fs=13;setZoom(1);applyTheme('uds-escuro')}}
 else if(cfgAba=='editor'){
  b.innerHTML=`<h3>Tamanho da fonte do editor: <span id="fv">${cfg.fs}</span></h3><input type="range" id="fs" min="10" max="24" value="${cfg.fs}" style="width:260px"><div class="hint">Mais opções do editor (fonte, quebra de linha, recuo) chegam nas etapas 2.x do roteiro.</div>`;
  $('#fs').oninput=e=>{cfg.fs=+e.target.value;$('#fv').textContent=cfg.fs;document.querySelectorAll('.ed').forEach(x=>x.style.fontSize=cfg.fs+'px');saveCfg()}}
 else if(cfgAba=='tipos'){
  b.innerHTML=`<h3>Tipos de arquivo</h3><input type="text" id="tf" placeholder="Filtrar por nome ou extensão (ex.: html, .png)" value="${esc(cfgFiltro)}"><div class="hint">Cada tipo tem ícone nos 2 estilos, em preto e branco. Criar tipos novos e associar ícones: etapa 1.65. Até lá, veja ReadMe/icones-personalizados.md.</div><div id="tl">${listaTiposHtml()}</div>`;
  $('#tf').oninput=e=>{cfgFiltro=e.target.value;$('#tl').innerHTML=listaTiposHtml()};$('#tf').focus()}
 else if(cfgAba=='atalhos'){
  b.innerHTML=`<h3>Atalhos de teclado</h3><table>${[['Ctrl+O','Abrir pasta'],['Ctrl+S','Salvar'],['Ctrl+,','Abrir estas configurações'],['Ctrl +  /  Ctrl −  /  Ctrl 0','Aumentar, diminuir e restaurar o zoom'],['Ctrl + roda do mouse','Zoom da interface'],['Tab (no editor)','Inserir 2 espaços'],['Esc','Fechar esta caixa']].map(([k,t])=>`<tr><td>${esc(k)}</td><td>${esc(t)}</td></tr>`).join('')}</table><div class="hint">Atalhos personalizáveis: etapa 4.70.</div>`}
 else if(cfgAba=='extensoes'){
  b.innerHTML=`<h3>Extensões</h3><div class="hint">Temas: disponíveis (veja a aba Aparência).<br>Pacotes de ícones em pastas: etapa 1.66.<br>Plugins de visualizador, editor e linguagem: etapas 6.00 a 6.50.<br>Gerenciador de extensões e permissões: etapas 7.00 e 7.50.</div>`}
 else{
  b.innerHTML=`<div style="text-align:center;padding-top:20px"><img src="logo.png" width="72" height="72" alt=""><h2 style="margin:10px 0 2px">Universal Development Studio</h2><div class="hint">Versão ${VERSION} · Licença MIT</div><div>One Studio. Unlimited Possibilities.</div><div class="hint" id="sb"></div></div>`;
  Promise.all([inv('portable_path'),Promise.resolve(themesDir)]).then(([p,t])=>{const e=$('#sb');if(e)e.innerHTML=`Dados portáteis: ${esc(p)}<br>Pasta de temas: ${esc(t||'não encontrada')}`})}}
$('#cfgx').onclick=fecharConfig;
(()=>{const w=$('#cfgwin'),h=w.querySelector('.ct');let o=null;h.onpointerdown=e=>{if(e.target.closest('button'))return;o=[e.clientX-w.offsetLeft,e.clientY-w.offsetTop];h.setPointerCapture(e.pointerId)};
 h.onpointermove=e=>{if(!o)return;w.style.left=Math.min(innerWidth-80,Math.max(80-w.offsetWidth,e.clientX-o[0]))+'px';w.style.top=Math.min(innerHeight-40,Math.max(0,e.clientY-o[1]))+'px'};h.onpointerup=()=>o=null})();

/* ---------- Início ---------- */
function renderAll(){renderRail();renderTop();renderTabs();renderSide();view();renderNotes();if(cfgAberta())renderConfig();$('#s1').textContent=root?'📁 '+base(root):'UDS '+VERSION}
document.addEventListener('keydown',e=>{const m=e.ctrlKey||e.metaKey;if(m&&e.key=='s'){e.preventDefault();saveAll()}else if(m&&e.key=='o'){e.preventDefault();openFolder()}else if(m&&e.key==','){e.preventDefault();abrirConfig()}else if(e.key=='Escape'&&cfgAberta()&&$('#mod').style.display!='grid'){fecharConfig()}else if(m&&(e.key=='+'||e.key=='=')){e.preventDefault();setZoom(cfg.zoom+.1)}else if(m&&(e.key=='-'||e.key=='_')){e.preventDefault();setZoom(cfg.zoom-.1)}else if(m&&e.key=='0'){e.preventDefault();setZoom(1)}});
document.addEventListener('wheel',e=>{if(e.ctrlKey){e.preventDefault();setZoom(cfg.zoom+(e.deltaY<0?.1:-.1))}},{passive:false});
$('#t1').onclick=()=>toggle('sideOpen');$('#t2').onclick=()=>toggle('panelOpen');$('#t3').onclick=()=>toggle('notesOpen');$('#zl').onclick=()=>setZoom(1);
(async()=>{UDSLoading.etapa('Carregando as configurações…',.2);try{Object.assign(cfg,JSON.parse(await inv('load_config')))}catch(e){}UDSLoading.preferencia(cfg.mostrarLoading!==false);if(!ESTILOS.includes(cfg.iconStyle))cfg.iconStyle='estilo1';if(!cfg.themeId||cfg.themeId=='uds-escuro'&&cfg.theme=='light')cfg.themeId=cfg.theme=='light'?'uds-claro':'uds-escuro';UDSLoading.etapa('Lendo os temas…',.55);await loadThemes();applyTheme(cfg.themeId,false);setZoom(cfg.zoom);UDSLoading.etapa('Montando a interface…',.85);applyLayout();renderAll();showPanel();log('UDS '+VERSION+' pronto. Dados portáteis em: '+await inv('portable_path'))})().catch(e=>console.error(e)).finally(()=>UDSLoading.concluir());
