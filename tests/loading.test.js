// Testes da tela de loading (1.05): lógica pura e ligação correta no index.html e no app.js.
// O comportamento completo no app (etapas, pular, desligar, limite de segurança) está em tests/loading.navegador.js.
const test=require('node:test'),assert=require('node:assert'),fs=require('node:fs'),path=require('node:path');
const L=require('../src/loading.js'),SRC=path.join(__dirname,'..','src');
const html=fs.readFileSync(path.join(SRC,'index.html'),'utf8'),app=fs.readFileSync(path.join(SRC,'app.js'),'utf8'),css=fs.readFileSync(path.join(SRC,'styles.css'),'utf8');
test('espera o tempo mínimo e nunca devolve valor negativo',()=>{
 assert.equal(L.esperaRestante(0),L.MINIMO);assert.equal(L.esperaRestante(400),L.MINIMO-400);assert.equal(L.esperaRestante(L.MINIMO),0);assert.equal(L.esperaRestante(99999),0);assert.equal(L.esperaRestante(300,1000),700)});
test('a barra de progresso só avança e fica entre 0 e 1',()=>{
 assert.equal(L.proximaFracao(0,.2),.2);assert.equal(L.proximaFracao(.5,.2),.5);assert.equal(L.proximaFracao(.5,5),1);assert.equal(L.proximaFracao(.5,-3),.5);assert.equal(L.proximaFracao(.3,'x'),.3);assert.equal(L.proximaFracao(0,undefined),0)});
test('limites razoáveis: mínimo curto o bastante para não irritar e limite de segurança finito',()=>{
 assert.ok(L.MINIMO>=800&&L.MINIMO<=2000);assert.ok(L.LIMITE>L.MINIMO&&L.LIMITE<=15000);assert.ok(L.FADE>0&&L.FADE<1000)});
test('o painel está no index.html, antes do app, e loading.js carrega antes de app.js',()=>{
 assert.ok(html.indexOf('id="uds-splash"')>0&&html.indexOf('id="uds-splash"')<html.indexOf('<div id="app">'),'painel antes do app');
 for(const id of ['sp-st','sp-bar','sp-ver'])assert.ok(html.includes(`id="${id}"`),id);
 assert.ok(html.indexOf('src="loading.js"')>0&&html.indexOf('src="loading.js"')<html.indexOf('src="app.js"'));
 assert.ok(html.includes('aria-live="polite"'),'anunciado para leitores de tela')});
test('o app.js informa as etapas e sempre conclui, mesmo com erro',()=>{
 for(const e of ['Carregando as configurações','Lendo os temas','Montando a interface'])assert.ok(app.includes(e),e);
 assert.ok(/\}\)\(\)\.catch\(.*?\)\.finally\(\(\)=>UDSLoading\.concluir\(\)\)/.test(app),'concluir() em finally');
 assert.ok(app.includes('UDSLoading.versao(VERSION)'));assert.ok(app.includes("id=\"ld\""),'opção nas configurações');
 assert.ok(app.includes('mostrarLoading'))});
test('o estilo respeita "reduzir movimento" e tem a identidade fixa da marca',()=>{
 assert.ok(css.includes('prefers-reduced-motion'));assert.ok(/#uds-splash\{[^}]*position:fixed/.test(css));assert.ok(css.includes('#ff8a3d')&&css.includes('#ff3d6e'))});
