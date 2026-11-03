// Interface do UDS. Fala com o núcleo Rust (src-tauri/src/main.rs) via invoke().
if(!window.__TAURI__){document.body.innerHTML='<p style="padding:20px">Abra o UDS pelo executável UniversalDevelopmentStudio.</p>';throw new Error('sem Tauri')}
const T=window.__TAURI__,$=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const base=p=>p.split(/[\\/]/).pop();
const ext_=p=>base(p).includes('.')?base(p).split('.').pop().toLowerCase():'';
const par=p=>p.slice(0,Math.max(p.lastIndexOf('/'),p.lastIndexOf('\\')));
const join=(d,n)=>d+(d.includes('\\')?'\\':'/')+n;
const inv=(c,a)=>T.core.invoke(c,a),url=p=>T.core.convertFileSrc(p);
let root=null,cfg={theme:'dark',recent:[],fs:13},docs={},tabs=[],active=null,dirs={},openD={},side='exp',raf=0,branch='',vw={img:1,m3d:1,aud:1,vid:1};
const log=t=>{const o=$('#out');o.textContent+=t+'\n';o.scrollTop=o.scrollHeight};
const KMAP={image:'img',audio:'aud',video:'vid',model:'m3d',glb:'glb',binary:'bin',text:'txt'};
const kindOf=p=>{const d=docs[p];return d.kind=='text'&&['obj','model'].includes(ext_(p))?'m3d':KMAP[d.kind]};
const icon=n=>{const e=ext_(n);return['png','jpg','jpeg','gif','webp','svg','bmp'].includes(e)?'🖼️':['mp3','wav','ogg','flac'].includes(e)?'🎵':['mp4','webm','mov'].includes(e)?'🎬':['obj','glb','gltf','stl','model'].includes(e)?'🧊':'📄'};
const LN={ts:'TypeScript',js:'JavaScript',css:'CSS',json:'JSON',md:'Markdown',py:'Python',html:'HTML',rs:'Rust'};
const saveCfg=()=>inv('save_config',{json:JSON.stringify(cfg)}).catch(()=>{});
function ask(l,v=''){return new Promise(r=>{const m=$('#mod'),i=$('#mi');$('#ml').textContent=l;i.value=v;m.style.display='grid';i.focus();i.select();const done=x=>{m.style.display='none';i.onkeydown=null;r(x)};i.onkeydown=e=>{if(e.key=='Enter')done(i.value.trim());if(e.key=='Escape')done(null)}})}

/* ---------- Menus ---------- */
const M={File:[['Open Folder…','Ctrl+O',openFolder],['Open File…','',openFile],['Novo arquivo','',()=>mk(root,false)],['Nova pasta','',()=>mk(root,true)],['Salvar tudo','Ctrl+S',saveAll],['Fechar aba','',()=>close(active)]],
Edit:[['Buscar nos arquivos','',()=>sidebar('search')],['Reabrir como texto','',()=>reopen(active)]],
Selection:[['Selecionar tudo','',()=>{const t=$('textarea');t&&t.select()}]],
View:[['Alternar tema','',toggleTheme],['Barra lateral','',()=>{$('#side').style.display=$('#side').style.display=='none'?'':'none'}],['Terminal','',()=>{$('#panel').style.display=$('#panel').style.display=='none'?'':'none'}]],
Go:[['Explorer','',()=>sidebar('exp')],['Visualizers','',()=>sidebar('vis')]],
Run:[['Run File','F5',runFile]],
Terminal:[['Limpar terminal','',()=>$('#out').textContent='']],
Help:[['Sobre o UDS','',()=>log('Universal Development Studio — One Studio. Unlimited Possibilities.')]]};
const mb=$('#menu'),dd=document.createElement('div');dd.id='drop';mb.appendChild(dd);
for(const k in M){const e=document.createElement('span');e.className='mi';e.textContent=k;e.onclick=ev=>{ev.stopPropagation();const on=e.classList.contains('on');hideMenus();if(on)return;e.classList.add('on');dd.style.left=e.offsetLeft+'px';dd.style.display='block';dd.innerHTML='';M[k].forEach(([n,s,f])=>{const d=document.createElement('div');d.innerHTML=esc(n)+'<small>'+s+'</small>';d.onclick=()=>{hideMenus();f()};dd.appendChild(d)})};mb.appendChild(e)}
function hideMenus(){dd.style.display='none';$('#ctx').style.display='none';document.querySelectorAll('.mi').forEach(x=>x.classList.remove('on'))}
document.onclick=hideMenus;

/* ---------- Pastas e arquivos ---------- */
async function loadDir(p){dirs[p]=await inv('list_dir',{path:p})}
async function setRoot(p){root=p;dirs={};openD={};docs={};tabs=[];active=null;await loadDir(p);cfg.recent=[p,...cfg.recent.filter(x=>x!=p)].slice(0,8);saveCfg();renderTabs();view();sidebar('exp');gitBranch();log('Pasta aberta: '+p)}
async function openFolder(){const p=await T.dialog.open({directory:true});if(p)setRoot(p)}
async function openFile(){const p=await T.dialog.open({multiple:false});if(p)openF(p)}
async function toggle(d){if(openD[d])delete openD[d];else{try{await loadDir(d);openD[d]=1}catch(e){log('Erro: '+e)}}sidebar('exp')}
async function refresh(){for(const k of Object.keys(dirs)){try{await loadDir(k)}catch(e){delete dirs[k]}}sidebar(side)}
async function mk(dir,isDir){if(!root)return log('Abra uma pasta primeiro.');const n=await ask(isDir?'Nome da nova pasta:':'Nome do novo arquivo:');if(!n)return;const p=join(dir||root,n);try{await inv(isDir?'create_dir':'write_file',isDir?{path:p}:{path:p,content:''});if(!dirs[dir||root])await loadDir(dir||root);openD[dir||root]=1;await refresh();if(!isDir)openF(p)}catch(e){log('Erro: '+e)}}
async function ren(p){const n=await ask('Novo nome:',base(p));if(!n||n==base(p))return;try{await inv('rename_path',{from:p,to:join(par(p),n)});closeUnder(p);await refresh()}catch(e){log('Erro: '+e)}}
async function del(p){if(await ask(`Excluir "${base(p)}"? Digite sim para confirmar.`)!='sim')return;try{await inv('delete_path',{path:p});closeUnder(p);await refresh()}catch(e){log('Erro: '+e)}}
function closeUnder(p){tabs.filter(t=>t==p||t.startsWith(p+'/')||t.startsWith(p+'\\')).forEach(close)}
async function openF(p){if(!docs[p]){try{docs[p]={...await inv('read_file',{path:p,forceText:false}),dirty:false}}catch(e){log('Erro: '+e);return}}if(!tabs.includes(p))tabs.push(p);active=p;renderTabs();view();if(side=='exp')sidebar('exp')}
async function reopen(p){if(!p)return;try{docs[p]={...await inv('read_file',{path:p,forceText:true}),dirty:false};view();renderTabs()}catch(e){log('Erro: '+e)}}
function close(p){if(!p)return;tabs=tabs.filter(t=>t!=p);delete docs[p];if(active==p)active=tabs[tabs.length-1]||null;renderTabs();view();if(side=='exp')sidebar('exp')}
async function saveAll(){for(const p of tabs){const d=docs[p];if(d&&d.dirty&&d.kind=='text'){try{await inv('write_file',{path:p,content:d.text});d.dirty=false}catch(e){log('Erro ao salvar: '+e)}}}renderTabs();if(side=='exp')sidebar('exp');log('Salvo.')}
function toggleTheme(){cfg.theme=cfg.theme=='dark'?'light':'dark';document.documentElement.dataset.theme=cfg.theme;saveCfg()}
function renderTabs(){const t=$('#tabs');t.innerHTML='';tabs.forEach(p=>{const d=document.createElement('div');d.className='tab'+(p==active?' on':'');d.innerHTML=`${icon(p)} ${esc(base(p))}${docs[p]&&docs[p].dirty?' ●':''} <i title="Fechar">✕</i>`;d.onclick=()=>openF(p);d.querySelector('i').onclick=e=>{e.stopPropagation();close(p)};t.appendChild(d)})}

/* ---------- Barra de atividades e lateral ---------- */
const ACT=[['exp','📁','Explorer'],['search','🔍','Search'],['git','⑂','Source Control'],['run','▶','Run and Debug'],['ext','🧩','Extensions'],['vis','👁','Visualizers'],['set','⚙','Settings']];
ACT.forEach(([id,ic,t])=>{if(id=='set'){const s=document.createElement('div');s.className='sp';$('#act').appendChild(s)}const b=document.createElement('button');b.textContent=ic;b.title=t;b.setAttribute('aria-label',t);b.dataset.id=id;b.onclick=()=>sidebar(id);$('#act').appendChild(b)});
function tree(p,d){return(dirs[p]||[]).map(e=>{const pad=`style="padding-left:${8+d*12}px"`;if(e.is_dir){const o=openD[e.path];return`<div class="it" ${pad} data-d="${esc(e.path)}">${o?'▾':'▸'} 📂 ${esc(e.name)}</div>`+(o?tree(e.path,d+1):'')}return`<div class="it ${active==e.path?'on':''}" ${pad} data-p="${esc(e.path)}">${icon(e.name)} ${esc(e.name)}${docs[e.path]&&docs[e.path].dirty?' ●':''}</div>`}).join('')}
function sidebar(id){side=id;$('#side').style.display='';document.querySelectorAll('#act button').forEach(b=>b.classList.toggle('on',b.dataset.id==id));const s=$('#side');
if(id=='exp'){s.innerHTML=root?`<h4>${esc(base(root).toUpperCase())}<span style="float:right"><button data-a="nf">＋📄</button> <button data-a="nd">＋📁</button> <button data-a="rf">⟳</button></span></h4>`+tree(root,0):'<h4>EXPLORER</h4><div class="pad">Nenhuma pasta aberta.<br><br><button data-a="of">Open Folder</button></div>';
 s.querySelectorAll('[data-p]').forEach(e=>e.onclick=()=>openF(e.dataset.p));s.querySelectorAll('[data-d]').forEach(e=>e.onclick=()=>toggle(e.dataset.d));
 s.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>({nf:()=>mk(root,false),nd:()=>mk(root,true),rf:refresh,of:openFolder})[b.dataset.a]())}
else if(id=='search'){s.innerHTML='<h4>SEARCH</h4><input id="q" placeholder="Buscar e pressionar Enter…"><div id="r"></div>';$('#q').onkeydown=async e=>{if(e.key!='Enter'||!root||!e.target.value)return;const r=await inv('search',{root,query:e.target.value});$('#r').innerHTML=r.map(p=>`<div class="it" data-p="${esc(p)}">${icon(p)} ${esc(p.slice(root.length+1))}</div>`).join('')||'<div class="pad">Nenhum resultado.</div>';$('#r').querySelectorAll('[data-p]').forEach(x=>x.onclick=()=>openF(x.dataset.p))}}
else if(id=='git'){s.innerHTML='<h4>SOURCE CONTROL</h4><div class="pad">Carregando…</div>';root?inv('run_command',{cmd:'git status --short',cwd:root}).then(o=>{s.innerHTML='<h4>SOURCE CONTROL</h4><div class="pad" style="white-space:pre-wrap">'+esc(o.trim()||'Sem alterações.')+'</div>'}):s.innerHTML='<h4>SOURCE CONTROL</h4><div class="pad">Abra uma pasta.</div>'}
else if(id=='run'){s.innerHTML='<h4>RUN AND DEBUG</h4><div class="pad"><button id="rb">▶ Run File</button><p>Executa o arquivo ativo (.js com Node, .py com Python, .sh, .bat). Exige o interpretador instalado.</p></div>';$('#rb').onclick=runFile}
else if(id=='ext'){s.innerHTML='<h4>EXTENSIONS</h4>'+[['img','Image Viewer'],['m3d','3D Viewer'],['aud','Audio Viewer'],['vid','Video Viewer']].map(([k,n])=>`<div class="it"><label><input type="checkbox" data-x="${k}" ${vw[k]?'checked':''}> ${n}</label></div>`).join('')+'<div class="pad">Pasta de plugins: plugins/ ao lado do executável. O carregamento de plugins entra na Fase 4.</div>';s.querySelectorAll('[data-x]').forEach(c=>c.onchange=()=>{vw[c.dataset.x]=c.checked;view()})}
else if(id=='vis'){s.innerHTML='<h4>VISUALIZERS</h4><div class="pad">Imagens: PNG, JPG, GIF, WEBP, SVG<br>3D: OBJ e .model (JSON)<br>Áudio: MP3, WAV, OGG, FLAC<br>Vídeo: MP4, WEBM<br><br>Identificação pelo conteúdo, não pela extensão.<br>Use Edit › Reabrir como texto para escolher manualmente.</div>'}
else{s.innerHTML='<h4>SETTINGS</h4><div class="pad">Tema<br><select id="th"><option value="dark">Escuro</option><option value="light">Claro</option></select><br><br>Fonte do editor<br><input type="range" id="fs" min="11" max="22" value="'+cfg.fs+'" style="width:100%"><br><br><span id="pp"></span></div>';$('#th').value=cfg.theme;$('#th').onchange=e=>{cfg.theme=e.target.value;document.documentElement.dataset.theme=cfg.theme;saveCfg()};$('#fs').oninput=e=>{cfg.fs=+e.target.value;document.querySelectorAll('.ed').forEach(x=>x.style.fontSize=cfg.fs+'px');saveCfg()};inv('portable_path').then(p=>$('#pp').textContent='Configurações em: '+p)}}
$('#side').oncontextmenu=e=>{e.preventDefault();if(side!='exp'||!root)return;const t=e.target.closest('[data-p],[data-d]'),p=t&&(t.dataset.p||t.dataset.d),dir=!t?root:t.dataset.d||par(p);const it=[['Novo arquivo',()=>mk(dir,false)],['Nova pasta',()=>mk(dir,true)]];if(p)it.push(['Renomear',()=>ren(p)],['Excluir',()=>del(p)]);const c=$('#ctx');c.innerHTML='';it.forEach(([n,f])=>{const d=document.createElement('div');d.textContent=n;d.onclick=()=>{hideMenus();f()};c.appendChild(d)});c.style.left=e.clientX+'px';c.style.top=e.clientY+'px';c.style.display='block'};

/* ---------- Visualização ---------- */
function status(x){$('#s1').textContent=(root?'📁 '+base(root):'UDS')+(branch?'  ⑂ '+branch:'');$('#s2').textContent=x||''}
function welcome(){const v=$('#view');v.innerHTML=`<div class="wel"><h1>Universal Development Studio</h1>One Studio. Unlimited Possibilities.<br><br><button data-a="of">Open Folder</button> <button data-a="ofi">Open File</button><br><br>${cfg.recent.length?'Projetos recentes':''}${cfg.recent.map(r=>`<div><a href="#" data-r="${esc(r)}" style="color:var(--ac)">${esc(r)}</a></div>`).join('')}</div>`;v.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>b.dataset.a=='of'?openFolder():openFile());v.querySelectorAll('[data-r]').forEach(a=>a.onclick=e=>{e.preventDefault();setRoot(a.dataset.r).catch(x=>log('Erro: '+x))})}
function view(){cancelAnimationFrame(raf);const v=$('#view');v.innerHTML='';status();$('#s3').textContent='';if(!active)return welcome();
const k=kindOf(active);$('#s3').textContent=k=='txt'?(LN[ext_(active)]||'Texto'):{img:'Image Viewer',m3d:'3D Viewer',aud:'Audio Viewer',vid:'Video Viewer',glb:'GLB',bin:'Binário'}[k];
if(k=='txt')return editor(active);
if(k=='bin'||k=='glb'){v.innerHTML=`<div class="wel">${k=='glb'?'Modelos GLB serão suportados por plugin (Fase 3).':'Formato desconhecido.'}<br><button id="rt">Abrir como texto</button></div>`;$('#rt').onclick=()=>reopen(active);return}
if(!vw[k]){v.innerHTML='<div class="wel">Visualizador desativado em Extensions.</div>';return}
({img:vImg,m3d:v3d,aud:vAud,vid:vVid})[k](active)}
const KW='function|const|let|var|return|if|else|for|while|import|from|export|default|class|new|interface|type|async|await|def|in|of|true|false|null|this|console|void|string|boolean|fn|mut|pub|use|struct|impl|match';
function hi(s,l){const cm=l=='py'?'#.*':'\\/\\/.*|\\/\\*[\\s\\S]*?\\*\\/';if(l=='md'||l==''||l=='html')return esc(s);const re=new RegExp('('+cm+')|("(?:\\\\.|[^"\\\\\\n])*"|\'(?:\\\\.|[^\'\\\\\\n])*\')|\\b('+KW+')\\b|\\b(\\d+\\.?\\d*)\\b','g');let o='',i=0,m;while((m=re.exec(s))){o+=esc(s.slice(i,m.index));o+=`<i class="${m[1]?'c':m[2]?'s':m[3]?'k':'n'}">${esc(m[0])}</i>`;i=re.lastIndex}return o+esc(s.slice(i))}
function editor(p){const v=$('#view'),d=docs[p];v.innerHTML='<div class="ed"><div class="gu"></div><pre></pre><textarea spellcheck="false" wrap="off"></textarea></div>';v.querySelector('.ed').style.fontSize=cfg.fs+'px';const ta=v.querySelector('textarea'),pre=v.querySelector('pre'),gu=v.querySelector('.gu');ta.value=d.text;
const up=()=>{pre.innerHTML=hi(ta.value,ext_(p))+'\n';gu.innerHTML=Array.from({length:ta.value.split('\n').length},(_,i)=>i+1).join('<br>')};
const cur=()=>{const a=ta.value.slice(0,ta.selectionStart).split('\n');status(`Ln ${a.length}, Col ${a[a.length-1].length+1}`)};
ta.oninput=()=>{d.text=ta.value;if(!d.dirty){d.dirty=true;renderTabs()}up();cur()};
ta.onscroll=()=>{pre.style.transform=`translate(${-ta.scrollLeft}px,${-ta.scrollTop}px)`;gu.style.transform=`translateY(${-ta.scrollTop}px)`};
ta.onkeyup=ta.onclick=cur;ta.onkeydown=e=>{if(e.key=='Tab'){e.preventDefault();document.execCommand('insertText',false,'  ')}};up();cur();ta.focus()}
function vImg(p){const v=$('#view');let z=1,r=0,dim='';v.innerHTML='<div class="tb"><button data-a="+">Zoom +</button><button data-a="-">Zoom −</button><button data-a="r">Girar 90°</button><button data-a="f">Ajustar</button><span id="ii"></span></div><div class="chk"><img alt=""></div>';const im=v.querySelector('img');im.src=url(p);
const ap=()=>{im.style.transform=`scale(${z}) rotate(${r}deg)`;$('#ii').textContent=`${dim} ${Math.round(z*100)}% · ${r}° · ${(docs[p].size/1024).toFixed(1)} KB · ${docs[p].mime}`};im.onload=()=>{dim=`${im.naturalWidth}×${im.naturalHeight} ·`;ap()};
v.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{const a=b.dataset.a;if(a=='+')z*=1.25;if(a=='-')z/=1.25;if(a=='r')r=(r+90)%360;if(a=='f'){z=1;r=0}ap()});ap()}
function vVid(p){const v=$('#view');v.innerHTML='<div class="tb"><button data-s=".5">0.5×</button><button data-s="1">1×</button><button data-s="2">2×</button><button data-f="-1">◀ Quadro</button><button data-f="1">Quadro ▶</button><span id="ii"></span></div><div class="chk" style="background:#000"><video controls></video></div>';const vd=v.querySelector('video');vd.src=url(p);
vd.onloadedmetadata=()=>$('#ii').textContent=`${vd.videoWidth}×${vd.videoHeight} · ${vd.duration.toFixed(1)}s · ${docs[p].mime}`;
v.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>vd.playbackRate=+b.dataset.s);v.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{vd.pause();vd.currentTime+=b.dataset.f/30})}
async function vAud(p){const v=$('#view');v.innerHTML=`<div class="tb"><span id="ii" style="margin:0"></span></div><div style="padding:12px"><audio controls src="${esc(url(p))}" style="width:100%"></audio></div><canvas></canvas>`;
try{const ab=await new AudioContext().decodeAudioData(await (await fetch(url(p))).arrayBuffer());$('#ii').textContent=`${ab.duration.toFixed(1)}s · ${ab.sampleRate} Hz · ${ab.numberOfChannels} canal(is)`;const cv=v.querySelector('canvas'),c=cv.getContext('2d'),w=cv.width=cv.clientWidth,h=cv.height=cv.clientHeight,d=ab.getChannelData(0),st=Math.max(1,Math.floor(d.length/w));c.strokeStyle=getComputedStyle(document.documentElement).getPropertyValue('--ac');c.beginPath();for(let x=0;x<w;x++){let mn=1,mx=-1;for(let i=0;i<st;i+=Math.max(1,st>>6)){const s=d[x*st+i]||0;if(s<mn)mn=s;if(s>mx)mx=s}c.moveTo(x,h/2+mn*h/2);c.lineTo(x,h/2+mx*h/2)}c.stroke()}catch(e){$('#ii').textContent='Forma de onda indisponível para este formato.'}}
function parseModel(p,t){if(ext_(p)!='obj')return JSON.parse(t);const V=[],E=new Set();t.split('\n').forEach(l=>{const a=l.trim().split(/\s+/);if(a[0]=='v')V.push(a.slice(1,4).map(Number));else if(a[0]=='f'){const ix=a.slice(1).map(s=>{const n=parseInt(s);return n<0?V.length+n:n-1});ix.forEach((x,i)=>{const y=ix[(i+1)%ix.length];E.add(Math.min(x,y)+','+Math.max(x,y))})}});
const mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];V.forEach(q=>q.forEach((n,i)=>{if(n<mn[i])mn[i]=n;if(n>mx[i])mx[i]=n}));const s=2/Math.max(mx[0]-mn[0],mx[1]-mn[1],mx[2]-mn[2],1e-9);
return{v:V.map(q=>q.map((n,i)=>(n-(mn[i]+mx[i])/2)*s*(i==1?-1:1))),e:[...E].map(k=>k.split(',').map(Number))}}
function v3d(p){const v=$('#view');let m;try{m=parseModel(p,docs[p].text)}catch(e){v.innerHTML='<div class="wel">Modelo inválido.</div>';return}
v.innerHTML='<div class="tb"><button>Wireframe / Pontos</button><button>Perspectiva / Ortográfica</button><button>Auto-rotação</button><span id="ii"></span></div><canvas></canvas>';const cv=v.querySelector('canvas'),c=cv.getContext('2d'),bt=v.querySelectorAll('button');let ax=.5,ay=.6,zm=1,auto=true,pts=false,ort=false,dr=null;
bt[0].onclick=()=>pts=!pts;bt[1].onclick=()=>ort=!ort;bt[2].onclick=()=>auto=!auto;
cv.onpointerdown=e=>{dr=[e.clientX,e.clientY];cv.setPointerCapture(e.pointerId)};cv.onpointerup=()=>dr=null;cv.onpointermove=e=>{if(!dr)return;ay+=(e.clientX-dr[0])*.01;ax+=(e.clientY-dr[1])*.01;dr=[e.clientX,e.clientY]};cv.onwheel=e=>{e.preventDefault();zm*=e.deltaY<0?1.1:.9};
$('#ii').textContent=`${m.v.length} vértices · ${m.e.length} arestas · arraste para girar, role para zoom`;const col=getComputedStyle(document.documentElement).getPropertyValue('--ac');
(function f(){const w=cv.clientWidth,h=cv.clientHeight;if(cv.width!=w||cv.height!=h){cv.width=w;cv.height=h}if(auto)ay+=.01;c.clearRect(0,0,w,h);const sc=Math.min(w,h)/5*zm;
const P=m.v.map(([x,y,z])=>{const a=x*Math.cos(ay)+z*Math.sin(ay),b=z*Math.cos(ay)-x*Math.sin(ay),y2=y*Math.cos(ax)-b*Math.sin(ax),z2=y*Math.sin(ax)+b*Math.cos(ax),k=ort?1:3.5/(z2+3.5);return[w/2+a*sc*k,h/2+y2*sc*k]});
c.strokeStyle=c.fillStyle=col;c.lineWidth=1;if(pts)P.forEach(q=>c.fillRect(q[0]-1.5,q[1]-1.5,3,3));else{c.beginPath();m.e.forEach(([a,b])=>{c.moveTo(...P[a]);c.lineTo(...P[b])});c.stroke()}raf=requestAnimationFrame(f)})()}

/* ---------- Execução e terminal ---------- */
async function gitBranch(){branch='';if(root){try{const o=(await inv('run_command',{cmd:'git branch --show-current',cwd:root})).trim();if(/^[\w\-\/.]+$/.test(o))branch=o}catch(e){}}status()}
async function sh(cmd,cwd){log('> '+cmd);try{log((await inv('run_command',{cmd,cwd})).trimEnd())}catch(e){log('Erro: '+e)}}
async function runFile(){const p=active;if(!p)return log('Run File: abra um arquivo.');await saveAll();const q=`"${p}"`,c={js:'node '+q,py:'python '+q,sh:'sh '+q,bat:q}[ext_(p)];if(!c)return log('Run File: sem executor para .'+ext_(p));sh(c,par(p))}
$('#ci').onkeydown=e=>{if(e.key!='Enter')return;const c=e.target.value.trim();e.target.value='';if(!c)return;if(c=='clear')$('#out').textContent='';else sh(c,root||undefined)};
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key=='s'){e.preventDefault();saveAll()}if((e.ctrlKey||e.metaKey)&&e.key=='o'){e.preventDefault();openFolder()}if(e.key=='F5'){e.preventDefault();runFile()}});
(async()=>{try{Object.assign(cfg,JSON.parse(await inv('load_config')))}catch(e){}document.documentElement.dataset.theme=cfg.theme;sidebar('exp');view();log('UDS pronto. Dados portáteis em: '+await inv('portable_path'))})();
