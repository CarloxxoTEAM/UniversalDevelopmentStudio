// Teste do app REAL (index.html + app.js) em um Chromium: página inicial, projetos recentes, modos de trabalho e Visualizar.
// O núcleo Tauri é simulado, mas lê arquivos de verdade do disco (pasta temporária montada com as amostras dos testes).
// Opcional: não roda no "npm test". Uso: node tests/inicio.navegador.js   (requer Playwright e Chromium)
const http=require('node:http'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert');
let playwright;try{playwright=require('playwright')}catch(e){playwright=require('/opt/npm-tools/node_modules/playwright')}
const SRC=path.join(__dirname,'..','src'),AM=path.join(__dirname,'amostras');
// ---- projeto de teste em disco ----
const TMP=fs.mkdtempSync(path.join(os.tmpdir(),'uds-inicio-')),P=path.join(TMP,'projeto'),OUTRO=path.join(TMP,'outro');
fs.mkdirSync(path.join(P,'imagens'),{recursive:true});fs.mkdirSync(OUTRO);
fs.writeFileSync(path.join(P,'notas.txt'),'Primeira linha\nsegunda linha com palavras\nterceira\n');fs.writeFileSync(path.join(P,'codigo.py'),'def soma(a, b):\n    return a + b\n');
fs.copyFileSync(path.join(AM,'amostra.png'),path.join(P,'foto.png'));fs.copyFileSync(path.join(AM,'amostra.png'),path.join(P,'imagens','a.png'));fs.copyFileSync(path.join(AM,'amostra.png'),path.join(P,'imagens','b.png'));
fs.copyFileSync(path.join(AM,'audio','com-capa.mp3'),path.join(P,'musica.mp3'));fs.copyFileSync(path.join(AM,'video','vp9-opus.webm'),path.join(P,'video.webm'));fs.copyFileSync(path.join(AM,'amostra.pdf'),path.join(P,'doc.pdf'));
fs.writeFileSync(path.join(OUTRO,'leia.txt'),'outro projeto\n');
const SUMIDA=path.join(TMP,'pasta-que-nao-existe');
// ---- núcleo simulado (mesma lógica do read_file do Rust) ----
function sniff(h){if(h.slice(0,4).equals(Buffer.from([0x89,0x50,0x4e,0x47])))return['image','image/png'];if(h.slice(0,3).equals(Buffer.from([0xff,0xd8,0xff])))return['image','image/jpeg'];if(h.slice(0,4).toString('latin1')==='GIF8')return['image','image/gif'];return null}
function readFile(p,force){const st=fs.statSync(p),fd=fs.openSync(p,'r'),head=Buffer.alloc(Math.min(512,st.size));fs.readSync(fd,head,0,head.length,0);fs.closeSync(fd);
 const mk=(k,m,t)=>({kind:k,mime:m,text:t,size:st.size,head:[...head]});if(!force){const s=sniff(head);if(s)return mk(s[0],s[1],'');if(head.includes(0))return mk('binary','application/octet-stream','')}
 if(st.size>5e6)return mk('binary','application/octet-stream','');const buf=fs.readFileSync(p);let t;try{t=new TextDecoder('utf-8',{fatal:true}).decode(buf)}catch(e){return force?mk('text','text/plain',buf.toString('utf8')):mk('binary','application/octet-stream','')}
 if(!force&&t.slice(0,600).includes('<svg'))return mk('image','image/svg+xml','');return mk('text','text/plain',t)}
function listDir(p){return fs.readdirSync(p,{withFileTypes:true}).map(e=>({name:e.name,path:path.join(p,e.name),is_dir:e.isDirectory()})).sort((a,b)=>(b.is_dir-a.is_dir)||a.name.toLowerCase().localeCompare(b.name.toLowerCase()))}
const srv=http.createServer((q,r)=>{const u=new URL(q.url,'http://x');let f;if(u.pathname==='/__f')f=u.searchParams.get('p');else f=path.join(SRC,decodeURIComponent(u.pathname==='/'?'/index.html':u.pathname));
 if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}
 const tam=fs.statSync(f).size,t={'.js':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.webm':'video/webm','.mp3':'audio/mpeg'}[path.extname(f)]||'application/octet-stream',h=q.headers.range&&/bytes=(\d+)-(\d*)/.exec(q.headers.range);
 if(h){const a=+h[1],b=h[2]?Math.min(+h[2],tam-1):tam-1;r.writeHead(206,{'content-type':t,'accept-ranges':'bytes','content-range':`bytes ${a}-${b}/${tam}`,'content-length':b-a+1});fs.createReadStream(f,{start:a,end:b}).pipe(r)}
 else{r.writeHead(200,{'content-type':t,'accept-ranges':'bytes','content-length':tam});fs.createReadStream(f).pipe(r)}});
const perto=(a,b,t,m)=>assert.ok(Math.abs(a-b)<=t,`${m}: ${a} vs ${b}`);
(async()=>{await new Promise(r=>srv.listen(0,r));const base='http://127.0.0.1:'+srv.address().port;const br=await playwright.chromium.launch();
 async function abre(cfg0={}){const est={cfg:JSON.stringify({mostrarLoading:false,...cfg0}),salvos:0,dialogos:[]};const ctx=await br.newContext({viewport:{width:1180,height:760}}),pg=await ctx.newPage();pg.__erros=[];(global.__pgs=global.__pgs||[]).push(pg);pg.on('pageerror',e=>pg.__erros.push(e.message));pg.on('console',m=>{if(m.type()==='error')pg.__erros.push('console: '+m.text())});
  await pg.exposeFunction('__inv',async(c,json)=>{const a=JSON.parse(json);switch(c){case'load_config':return est.cfg;case'save_config':est.cfg=a.json;est.salvos++;return null;case'portable_path':return path.join(TMP,'portable');
   case'themes_path':throw new Error('sem pasta de temas');case'list_dir':return listDir(a.path);case'read_file':return readFile(a.path,a.forceText);case'write_file':fs.mkdirSync(path.dirname(a.path),{recursive:true});fs.writeFileSync(a.path,a.content);return null;
   case'create_dir':fs.mkdirSync(a.path,{recursive:true});return null;default:return null}});
  await pg.exposeFunction('__dialog',async()=>est.dialogos.shift()||null);
  await pg.addInitScript(()=>{window.__TAURI__={core:{convertFileSrc:p=>'/__f?p='+encodeURIComponent(p),invoke:(c,a)=>window.__inv(c,JSON.stringify(a||{}))},dialog:{open:o=>window.__dialog(JSON.stringify(o||{}))}}});
  await pg.goto(base+'/');await pg.waitForFunction(()=>{const e=document.getElementById('uds-splash');return !e||getComputedStyle(e).display==='none'},null,{timeout:10000});await pg.waitForFunction(()=>document.getElementById('s1').textContent.length>0);return{pg,ctx,est}}
 const cfgSalva=est=>JSON.parse(est.cfg),vis=(pg,s)=>pg.$eval(s,e=>getComputedStyle(e).display!=='none').catch(()=>false);
 const abrirPasta=async(pg,est,p)=>{est.dialogos.push(p);await pg.keyboard.press('Control+o');await pg.waitForFunction(()=>document.querySelectorAll('#side .it').length>0)};
 const menuCtx=async(pg,sel)=>{await pg.click(sel,{button:'right'});return pg.$$eval('#ctx div',d=>d.map(x=>x.textContent.replace(/\s+/g,' ').trim()))};
 const clicaMenu=async(pg,texto)=>{await pg.locator('#ctx div',{hasText:texto}).first().click()};

 // 1) migração dos recentes antigos (lista de textos) e página inicial na abertura
 { const {pg,ctx,est}=await abre({recent:[P,OUTRO,SUMIDA]});
   assert.equal(await vis(pg,'#inicio'),true,'a página inicial deveria abrir sozinha');
   assert.equal((await pg.$$('.in-it')).length,3);assert.equal((await pg.$$('.in-card')).length,4);
   assert.deepEqual(await pg.$$eval('.in-card',c=>c.map(x=>x.dataset.modo+':'+x.classList.contains('off'))),['universal:false','texto:false','audio:true','video:true']);
   assert.ok((await pg.$eval('.in-card.off small',e=>e.textContent)).includes('1.4.4'),'áudio indica a versão prevista');
   await pg.waitForSelector('.in-it.ausente',{timeout:3000});assert.equal(await pg.$$eval('.in-it.ausente',x=>x.length),1,'só a pasta que sumiu fica esmaecida');
   await pg.screenshot({path:'/tmp/inicio-1-pagina.png'});
   await pg.keyboard.press('Control+,');await pg.waitForSelector('#cfgbody');const salvo=cfgSalva(est);
   assert.equal(salvo.recent,undefined,'campo antigo removido ao migrar');
   console.log('ok migração e página inicial (3 recentes, 4 cartões, 1 pasta sumida)');await ctx.close() }

 // 2) teclado: ↓ e Enter abrem o projeto, a página inicial fecha, a lista sobe o projeto e guarda o modo
 { const {pg,ctx,est}=await abre({recentes:[{caminho:OUTRO,modo:'universal',fixado:false,ultimoUso:2000},{caminho:P,modo:'texto',fixado:false,ultimoUso:1000}]});
   assert.equal(await pg.$eval('.in-it.on b',e=>e.textContent),'outro');await pg.keyboard.press('ArrowDown');assert.equal(await pg.$eval('.in-it.on b',e=>e.textContent),'projeto');
   await pg.keyboard.press('Enter');await pg.waitForFunction(()=>document.querySelectorAll('#side .it').length>0);
   assert.equal(await vis(pg,'#inicio'),false,'a página inicial some ao abrir o projeto');
   assert.equal(await pg.$eval('#modo',e=>e.textContent.includes('Texto')),true,'o projeto voltou no modo em que foi usado');
   assert.equal(await vis(pg,'#txbar'),true);const s=cfgSalva(est);assert.equal(s.modo,'texto');assert.equal(s.recentes[0].caminho,P);assert.equal(s.recentes[0].modo,'texto');assert.equal(s.recentes.length,2);
   console.log('ok abrir pelo teclado, no modo guardado');await ctx.close() }

 // 2b) Esc fecha a página inicial
 { const {pg,ctx}=await abre({recentes:[{caminho:P,modo:'universal',ultimoUso:1}]});assert.equal(await vis(pg,'#inicio'),true);await pg.keyboard.press('Escape');assert.equal(await vis(pg,'#inicio'),false);console.log('ok Esc fecha a página inicial');await ctx.close() }
 // 3) fixar e remover; pasta sumida avisa e não muda nada
 { const {pg,ctx,est}=await abre({recentes:[{caminho:OUTRO,modo:'universal',ultimoUso:3000},{caminho:P,modo:'universal',ultimoUso:2000},{caminho:SUMIDA,modo:'texto',ultimoUso:1000}]});
   await pg.click('.in-it:nth-child(2) .in-pin');assert.equal(await pg.$eval('.in-it:first-child b',e=>e.textContent),'projeto','fixado vai para o topo');assert.equal(cfgSalva(est).recentes[0].fixado,true);
   await pg.click('.in-it:last-child',{button:'right'});await clicaMenu(pg,'Remover da lista');assert.equal((await pg.$$('.in-it')).length,2);assert.equal(cfgSalva(est).recentes.length,2);
   await pg.click('.in-it:last-child',{button:'right'});assert.deepEqual(await pg.$$eval('#ctx div',d=>d.map(x=>x.textContent.trim())),['Abrir','Fixar na lista','Remover da lista']);await pg.keyboard.press('Escape');
   await ctx.close();
   const b=await abre({recentes:[{caminho:SUMIDA,modo:'texto',ultimoUso:1000}]});await b.pg.click('.in-it');await b.pg.waitForFunction(()=>document.getElementById('s2').textContent.includes('não encontrada'));
   assert.equal(await vis(b.pg,'#inicio'),true,'continua na página inicial');assert.equal(cfgSalva(b.est).modo||'universal','universal','modo não mudou');console.log('ok fixar, remover e pasta sumida');await b.ctx.close() }

 // 4) modos: troca sem perder nada
 { const {pg,ctx,est}=await abre({recentes:[{caminho:P,modo:'universal',ultimoUso:1}]});await pg.keyboard.press('Enter');await pg.waitForFunction(()=>document.querySelectorAll('#side .it').length>0);
   await pg.click('#side [data-p$="notas.txt"]');await pg.waitForSelector('.ed textarea');await pg.click('.ed textarea');await pg.keyboard.press('Control+End');await pg.keyboard.type(' ALTERADO');
   assert.ok((await pg.$eval('#tabs',e=>e.textContent)).includes('●'),'aba suja');
   assert.equal(await vis(pg,'#side'),true);await pg.keyboard.press('Control+2');await pg.waitForFunction(()=>getComputedStyle(document.getElementById('txbar')).display!=='none');
   assert.equal(await vis(pg,'#side'),false,'Texto recolhe o explorador');assert.equal(await vis(pg,'#panel'),false);assert.equal(await vis(pg,'#notes'),false);
   assert.ok((await pg.$eval('#tabs',e=>e.textContent)).includes('notas.txt'),'a aba continua');assert.ok((await pg.$eval('#tabs',e=>e.textContent)).includes('●'),'a alteração continua');
   assert.ok((await pg.$eval('.ed textarea',e=>e.value)).endsWith(' ALTERADO'),'o texto digitado continua');
   assert.match(await pg.$eval('#tx-n',e=>e.textContent),/4 linhas · \d+ palavras · \d+ caracteres/);
   const antes=await pg.$eval('#tx-n',e=>e.textContent);await pg.click('.ed textarea');await pg.keyboard.type(' mais duas');assert.notEqual(await pg.$eval('#tx-n',e=>e.textContent),antes,'contagem atualiza ao digitar');
   await pg.screenshot({path:'/tmp/inicio-2-texto.png'});
   await pg.keyboard.press('Control+1');await pg.waitForFunction(()=>getComputedStyle(document.getElementById('side')).display!=='none');
   assert.equal(await vis(pg,'#panel'),true,'o Universal volta como estava');assert.equal(await vis(pg,'#notes'),true);assert.equal(await vis(pg,'#txbar'),false);assert.ok((await pg.$eval('.ed textarea',e=>e.value)).endsWith(' mais duas'));
   // áudio e vídeo ainda não existem
   await pg.keyboard.press('Control+3');await pg.waitForFunction(()=>document.getElementById('s2').textContent.includes('1.4.4'));assert.equal(cfgSalva(est).modo,'universal');
   await pg.keyboard.press('Control+4');await pg.waitForFunction(()=>document.getElementById('s2').textContent.includes('1.4.5'));
   console.log('ok modos: troca sem perder abas nem alterações; Áudio e Vídeo avisam') ;await ctx.close() }

 // 5) modo Texto não abre visualizadores: pede para trocar
 { const {pg,ctx}=await abre({recentes:[{caminho:P,modo:'texto',ultimoUso:1}]});await pg.keyboard.press('Enter');await pg.waitForFunction(()=>getComputedStyle(document.getElementById('txbar')).display!=='none');
   await pg.evaluate(()=>{document.getElementById('t1').click()});await pg.waitForSelector('#side [data-p$="foto.png"]');await pg.click('#side [data-p$="foto.png"]');
   await pg.waitForSelector('#tx-un');assert.ok((await pg.$eval('#view',e=>e.textContent)).includes('mostra só texto'));
   await pg.click('#tx-un');await pg.waitForSelector('#view .chk img');assert.equal(await pg.$eval('#modo',e=>e.textContent.includes('Universal')),true);console.log('ok Texto pede para trocar de modo ao abrir uma imagem');await ctx.close() }

 // 6) Visualizar: botão direito, itens antigos preservados e prévia de cada tipo
 { const {pg,ctx}=await abre({recentes:[{caminho:P,modo:'universal',ultimoUso:1}]});await pg.keyboard.press('Enter');await pg.waitForFunction(()=>document.querySelectorAll('#side .it').length>0);
   const sel=n=>`#side [data-p$="${n}"]`;
   assert.deepEqual(await menuCtx(pg,sel('notas.txt')),['Visualizar','Novo arquivo','Nova pasta','Renomear','Excluir'],'Visualizar no topo e os itens atuais na mesma ordem');await pg.keyboard.press('Escape');
   await pg.click('#side',{button:'right',position:{x:100,y:380}});assert.deepEqual(await pg.$$eval('#ctx div',d=>d.map(x=>x.textContent.trim())),['Novo arquivo','Nova pasta'],'área vazia mantém o menu antigo');
   const tabsAntes=await pg.$eval('#tabs',e=>e.querySelectorAll('.tab').length);
   const viz=async n=>{await menuCtx(pg,sel(n));await clicaMenu(pg,'Visualizar')};
   // texto
   await viz('notas.txt');await pg.waitForSelector('#prevwin .pv-tw');assert.ok((await pg.$eval('#prevwin .pv-tw pre',e=>e.textContent)).includes('segunda linha'));assert.equal(await pg.$$eval('#prevwin textarea',x=>x.length),0,'somente leitura');
   assert.equal(await pg.$eval('#tabs',e=>e.querySelectorAll('.tab').length),tabsAntes,'não abre aba');
   // imagem
   await viz('foto.png');await pg.waitForSelector('#prevwin .chk img');
   // áudio
   await viz('musica.mp3');await pg.waitForSelector('#prevwin .au-ctl, #prevwin #au-pp');
   // vídeo (toca de verdade)
   await viz('video.webm');await pg.waitForSelector('#prevwin video');await pg.waitForFunction(()=>{const v=document.querySelector('#prevwin video');return v&&v.readyState>=2},null,{timeout:8000});
   perto(await pg.$eval('#prevwin video',v=>v.duration),1.0,0.1,'duração do vídeo na prévia');
   await pg.screenshot({path:'/tmp/inicio-3-visualizar-video.png'});
   // pdf: formato reconhecido, sem visualizador
   await viz('doc.pdf');await pg.waitForSelector('#prevwin .pv-txtbtn');
   // pasta com miniaturas
   await pg.click('#side [data-d$="imagens"]',{button:'right'});await clicaMenu(pg,'Visualizar');await pg.waitForSelector('#prevwin .pv-th');assert.equal((await pg.$$('#prevwin .pv-th')).length,2);assert.match(await pg.$eval('#prevwin .pv-sub',e=>e.textContent),/2 itens · 0 pastas · 2 arquivos/);
   await pg.screenshot({path:'/tmp/inicio-4-visualizar-pasta.png'});
   // navegar dentro da prévia e voltar
   await pg.click('#prevwin .pv-it');await pg.waitForSelector('#prevwin .chk img');assert.equal(await vis(pg,'#prevwin .pv-volta'),true);await pg.click('#prevwin .pv-volta');await pg.waitForSelector('#prevwin .pv-lista');
   // Esc fecha a prévia antes da caixa de configurações
   await pg.keyboard.press('Control+,');await pg.waitForSelector('#cfgbody');await pg.keyboard.press('Escape');assert.equal(await vis(pg,'#prevwin'),false);assert.equal(await vis(pg,'#cfgwin'),true,'a configuração continua aberta');await pg.keyboard.press('Escape');assert.equal(await vis(pg,'#cfgwin'),false);
   // abrir no UDS
   await viz('codigo.py');await pg.waitForSelector('#prevwin .pv-tw');await pg.click('#prevwin .pv-abrir');await pg.waitForSelector('.ed textarea');assert.equal(await vis(pg,'#prevwin'),false);assert.equal(await pg.$eval('#tabs',e=>e.querySelectorAll('.tab').length),tabsAntes+1);
   console.log('ok Visualizar: texto, imagem, áudio, vídeo, pdf, pasta, navegação, Esc e Abrir no UDS');await ctx.close() }

 // 7) configurações: aba "Início e modos"
 { const {pg,ctx,est}=await abre({recentes:[{caminho:P,modo:'universal',ultimoUso:1}]});await pg.keyboard.press('Control+,');await pg.click('#cfgnav div:has-text("Início e modos")');await pg.waitForSelector('#cn1');
   assert.equal(await pg.$eval('#cn1',e=>e.checked),true);assert.equal(await pg.$eval('#cn2',e=>e.checked),false);await pg.click('#cn1');assert.equal(cfgSalva(est).inicio.mostrar,false);await pg.click('#cn2');assert.equal(cfgSalva(est).inicio.reabrir,true);
   await pg.screenshot({path:'/tmp/inicio-5-config.png'});await ctx.close();
   // ligar "reabrir o último projeto": abre direto no modo guardado, sem a página inicial
   const b=await abre({inicio:{mostrar:true,reabrir:true},recentes:[{caminho:P,modo:'texto',ultimoUso:1}]});await b.pg.waitForFunction(()=>document.querySelectorAll('#side .it').length>0||getComputedStyle(document.getElementById('txbar')).display!=='none');
   assert.equal(await vis(b.pg,'#inicio'),false);assert.equal(await b.pg.$eval('#modo',e=>e.textContent.includes('Texto')),true);console.log('ok configurações: início e modos; reabrir o último projeto');await b.ctx.close();
   // desligada: não mostra a página inicial
   const c=await abre({inicio:{mostrar:false,reabrir:false}});assert.equal(await vis(c.pg,'#inicio'),false);await c.pg.locator('#logo').click();await c.pg.locator('#drop div',{hasText:'Página inicial'}).first().click();assert.equal(await vis(c.pg,'#inicio'),true,'volta pelo menu');await c.ctx.close() }

 await br.close();srv.close();fs.rmSync(TMP,{recursive:true,force:true});console.log('TUDO OK')})().catch(async e=>{console.error(e);for(const g of global.__pgs||[])if(g.__erros.length)console.error('erros na página:',g.__erros);process.exit(1)});
