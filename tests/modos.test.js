// Modos de trabalho (1.4.2): registro, troca de layout sem perder nada, migração e ligação no index.html/app.js.
const test=require('node:test'),assert=require('node:assert'),fs=require('node:fs'),path=require('node:path');
global.UDSModos=require('../src/modos/registro.js');
require('../src/modos/universal.js');const TXT=require('../src/modos/texto.js');require('../src/modos/futuros.js');
const M=global.UDSModos,SRC=path.join(__dirname,'..','src'),html=fs.readFileSync(path.join(SRC,'index.html'),'utf8'),app=fs.readFileSync(path.join(SRC,'app.js'),'utf8'),css=fs.readFileSync(path.join(SRC,'styles.css'),'utf8');
const L=(s,p,n)=>({sideOpen:s,panelOpen:p,notesOpen:n});
test('os quatro modos, na ordem, com atalhos Ctrl+1 a Ctrl+4',()=>{
 assert.deepEqual(M.lista().map(m=>m.id),['universal','texto','audio','video']);assert.deepEqual(M.lista().map(m=>m.atalho),['1','2','3','4']);
 assert.equal(M.doAtalho('2').id,'texto');assert.equal(M.doAtalho(4).id,'video');assert.equal(M.doAtalho('9'),null);assert.equal(M.obter('nada'),null);
 for(const m of M.lista()){assert.ok(m.nome&&m.desc&&m.icone.includes('<'),m.id)}
 assert.equal(M.obter('audio').disponivel,false);assert.equal(M.obter('audio').previsto,'1.4.4');assert.equal(M.obter('video').previsto,'1.4.5');assert.equal(M.obter('texto').disponivel,true)});
test('registrar exige id e substitui um modo com o mesmo id',()=>{assert.throws(()=>M.registrar({}));const n=M.lista().length;M.registrar({id:'universal',nome:'Universal',atalho:'1',desc:'x',icone:'<g/>'});assert.equal(M.lista().length,n);M.registrar({id:'universal',nome:'Universal',atalho:'1',desc:'Tudo do UDS: explorador, abas, editor, notas e painel.',icone:'<rect/>'})});
test('Universal → Texto recolhe tudo; Texto → Universal devolve o layout que a pessoa tinha',()=>{
 const cfg={modo:'universal',...L(true,false,true),zoom:1.2,fs:15};const r=M.trocar(cfg,'texto');assert.deepEqual(r,{ok:true,de:'universal',para:'texto'});
 assert.deepEqual([cfg.modo,cfg.sideOpen,cfg.panelOpen,cfg.notesOpen],['texto',false,false,false]);assert.deepEqual(cfg.layouts.universal,L(true,false,true));
 M.trocar(cfg,'universal');assert.deepEqual([cfg.modo,cfg.sideOpen,cfg.panelOpen,cfg.notesOpen],['universal',true,false,true],'o Universal volta exatamente como estava');assert.equal(cfg.zoom,1.2);assert.equal(cfg.fs,15)});
test('cada modo lembra os painéis que a pessoa abriu nele',()=>{
 const cfg={modo:'universal',...L(true,true,true)};M.trocar(cfg,'texto');cfg.sideOpen=true;M.trocar(cfg,'universal');M.trocar(cfg,'texto');assert.deepEqual(M.layoutAtual(cfg),L(true,false,false),'o Texto lembra que o explorador ficou aberto')});
test('modo indisponível ou desconhecido não muda nada',()=>{
 const cfg={modo:'texto',...L(false,false,false),layouts:{}};const antes=JSON.stringify(cfg);
 assert.deepEqual(M.trocar(cfg,'audio'),{ok:false,motivo:'indisponivel',previsto:'1.4.4'});assert.deepEqual(M.trocar(cfg,'x'),{ok:false,motivo:'desconhecido'});assert.equal(JSON.stringify(cfg),antes)});
test('trocar só mexe no layout: nenhum outro campo (tema, abas, projeto...) é tocado',()=>{
 const cfg={modo:'universal',...L(true,true,true),themeId:'uds-claro',recentes:[{caminho:'/p'}],tabs:['a','b'],qualquer:{x:1}};const copia=JSON.parse(JSON.stringify(cfg));M.trocar(cfg,'texto');M.trocar(cfg,'universal');
 for(const k of ['themeId','recentes','tabs','qualquer'])assert.deepEqual(cfg[k],copia[k],k)});
test('trocar para o mesmo modo é seguro',()=>{const cfg={modo:'texto',...L(false,false,true)};const r=M.trocar(cfg,'texto');assert.equal(r.ok,true);assert.deepEqual(M.layoutAtual(cfg),L(false,false,true))});
test('primeira abertura depois da atualização: o layout atual vira o do Universal',()=>{
 const cfg=M.iniciar({sideOpen:false,panelOpen:true,notesOpen:false});assert.equal(cfg.modo,'universal');assert.deepEqual(cfg.layouts.universal,L(false,true,false));
 assert.equal(M.iniciar({modo:'modo-que-nao-existe'}).modo,'universal');assert.equal(M.iniciar({modo:'texto',layouts:7}).layouts.constructor,Object);
 const ja=M.iniciar({modo:'universal',...L(true,true,true),layouts:{universal:L(false,false,false)}});assert.deepEqual(ja.layouts.universal,L(false,false,false),'não sobrescreve o que já foi guardado')});
test('contagem do modo Texto',()=>{
 assert.deepEqual(TXT.contarTexto(''),{linhas:0,palavras:0,caracteres:0});assert.deepEqual(TXT.contarTexto('olá mundo\nlinha 2'),{linhas:2,palavras:4,caracteres:17});
 assert.deepEqual(TXT.contarTexto('a\n\n\nb\n'),{linhas:5,palavras:2,caracteres:6});assert.deepEqual(TXT.contarTexto(null),{linhas:0,palavras:0,caracteres:0});assert.equal(TXT.contarTexto('  \t ').palavras,0);assert.equal(TXT.contarTexto('ação coração').palavras,2)});
test('o Texto só aceita o que abre no editor (sem visualizador)',()=>{const t=M.obter('texto');assert.equal(t.aceita('a.txt',{},false),true);assert.equal(t.aceita('a.png',{},true),false);assert.equal(t.abreExplorador,false);assert.equal(M.obter('universal').abreExplorador,true)});
test('ligação no index.html: elementos e ordem dos scripts',()=>{
 for(const id of ['modo','txbar','inicio','prevwin'])assert.ok(html.includes(`id="${id}"`),id);
 const ord=['recentes.js','modos/registro.js','modos/universal.js','modos/texto.js','modos/futuros.js','inicio.js','visualizar.js','app.js'].map(f=>html.indexOf(`src="${f}"`));assert.ok(ord.every(i=>i>0),'todos os scripts presentes');assert.deepEqual([...ord].sort((a,b)=>a-b),ord,'ordem de carregamento');
 assert.ok(html.indexOf('id="inicio"')<html.indexOf('id="notes"')+200&&html.indexOf('id="inicio"')>html.indexOf('id="notes"'),'a página inicial fica dentro da área principal');
 for(const f of fs.readdirSync(path.join(SRC,'modos')))assert.ok(html.includes(`src="modos/${f}"`),'modos/'+f+' no index.html')});
test('ligação no app.js: modos, página inicial, Visualizar e atalhos',()=>{
 for(const t of ['UDSRecentes.adicionar','UDSModos.trocar','UDSModos.iniciar','UDSInicio.montar','UDSVisualizar.criar','function setMode','function abrirProjeto','function mostrarInicio','function fecharInicio',"t:'Visualizar'",'Ctrl+1 a Ctrl+4'])assert.ok(app.includes(t),t);
 assert.equal((app.match(/cfg\.recent(?!es)/g)||[]).length,2,'a lista antiga cfg.recent só aparece na migração (ler e apagar)');
 assert.ok(/\.catch\(.*?\)\.finally\(\(\)=>UDSLoading\.concluir\(\)\)/.test(app),'o loading ainda conclui sempre');assert.ok(app.includes('Abrindo o último projeto'))});
test('estilos presentes e usando as variáveis do tema',()=>{
 for(const s of ['#inicio{','#prevwin{','#txbar{','.in-card','.pv-th'])assert.ok(css.includes(s),s);const bloco=css.slice(css.indexOf('Modos de trabalho, página inicial e Visualizar'));assert.ok(bloco.includes('var(--bg1)')&&bloco.includes('var(--tx)'));
 assert.ok(!/#[0-9a-f]{6}\b/i.test(bloco.replace(/#000b/g,'')),'sem cores fixas nos estilos novos (exceto a sombra)')});
