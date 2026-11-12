// Teste da tela de loading (1.05) no app REAL (index.html + app.js) em um Chromium, com o núcleo Tauri simulado.
// Opcional: não roda no "npm test". Uso: node tests/loading.navegador.js   (requer Playwright e Chromium)
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert');
let playwright;try{playwright=require('playwright')}catch(e){playwright=require('/opt/npm-tools/node_modules/playwright')}
const SRC=path.join(__dirname,'..','src');
const srv=http.createServer((q,r)=>{const f=path.join(SRC,decodeURIComponent(q.url.split('?')[0]==='/'?'/index.html':q.url.split('?')[0]));
 if(!f.startsWith(SRC)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}
 const t={'.js':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml'}[path.extname(f)]||'application/octet-stream';r.writeHead(200,{'content-type':t});fs.createReadStream(f).pipe(r)});
// Núcleo Tauri simulado: config configurável e um atraso opcional para segurar o carregamento.
const MOCK=(cfg,atraso,quebra)=>`window.__TAURI__={core:{convertFileSrc:p=>p,invoke:async(c,a)=>{
 if(${atraso}>0)await new Promise(r=>setTimeout(r,${atraso}));
 if(c==='load_config'){${quebra?"throw new Error('falhou')":""};return ${JSON.stringify(JSON.stringify(cfg))}}
 if(c==='save_config'){window.__salvo=a.json;return null}
 if(c==='portable_path')return '/portable';if(c==='themes_path')throw new Error('sem pasta');if(c==='list_dir')return [];return null}},dialog:{}};`;
(async()=>{await new Promise(r=>srv.listen(0,r));const base='http://127.0.0.1:'+srv.address().port;const br=await playwright.chromium.launch();
 async function abre(cfg,{atraso=0,quebra=false,reduzir=false,limpa=true,pagina}={}){const ctx=await br.newContext({viewport:{width:1100,height:700},reducedMotion:reduzir?'reduce':'no-preference'});
  const pg=pagina||await ctx.newPage();pg.__erros=[];pg.on('pageerror',e=>pg.__erros.push(e.message));await pg.addInitScript(MOCK(cfg,atraso,quebra));
  const t0=Date.now();await pg.goto(base+'/',{waitUntil:'commit'});return{pg,ctx,t0}}
 const visivel=pg=>pg.evaluate(()=>{const e=document.getElementById('uds-splash');return !!e&&getComputedStyle(e).display!=='none'&&getComputedStyle(e).opacity!=='0'});
 const gone=pg=>pg.waitForFunction(()=>{const e=document.getElementById('uds-splash');return !e||getComputedStyle(e).display==='none'},null,{timeout:12000});

 // 1) aparece, mostra etapas reais, respeita o tempo mínimo e some, deixando o app pronto
 { const {pg,ctx,t0}=await abre({},{atraso:120});
   await pg.waitForSelector('#uds-splash');assert.equal(await visivel(pg),true,'deveria aparecer');
   const vistos=new Set();for(let i=0;i<30;i++){vistos.add(await pg.$eval('#sp-st',e=>e.textContent));await pg.waitForTimeout(40)}
   console.log('etapas vistas:',[...vistos].join(' | '));
   assert.ok([...vistos].some(t=>/configura/i.test(t)),'etapa de configurações');assert.ok([...vistos].some(t=>/tema/i.test(t)),'etapa de temas');
   assert.ok((await pg.$eval('#sp-ver',e=>e.textContent)).startsWith('Versão 1.4.2'),'versão no painel');
   await gone(pg);const dt=Date.now()-t0;assert.ok(dt>=1200,'não pode sumir antes do mínimo: '+dt+' ms');assert.ok(dt<4500,'demorou demais: '+dt);
   assert.equal(await pg.$eval('#top',e=>getComputedStyle(e).display!=='none'),true);assert.ok((await pg.$eval('#s1',e=>e.textContent)).includes('UDS 1.4.2'),'o app subiu');
   assert.equal(await pg.$eval('#sp-bar',e=>e.style.transform),'scaleX(1)','barra completa');
   assert.deepEqual(pg.__erros,[],'erros: '+pg.__erros);console.log('ok aparece, mostra as etapas e some (',dt,'ms)');await pg.screenshot({path:'/tmp/loading-2-app.png'});await ctx.close()}
 // 1b) capturas em momentos fixos da animação (para conferir o visual)
 { const {pg,ctx}=await abre({},{atraso:900});await pg.waitForSelector('#uds-splash');for(const ms of [350,900,1500]){await pg.waitForTimeout(ms-(await pg.evaluate(()=>Math.round(performance.now()))));await pg.screenshot({path:'/tmp/loading-t'+ms+'.png'})}await ctx.close() }
 // 2) pular com clique, Esc e Enter
 for(const how of ['clique','Escape','Enter',' ']){const {pg,ctx,t0}=await abre({},{atraso:900});await pg.waitForSelector('#uds-splash');await pg.waitForTimeout(150);
   if(how==='clique')await pg.mouse.click(500,300);else await pg.keyboard.press(how);await gone(pg);const dt=Date.now()-t0;assert.ok(dt<1500,how+' deveria pular antes do fim: '+dt);await ctx.close();console.log('ok pular com',how==='clique'?'clique':JSON.stringify(how))}
 // 3) Ctrl+O e outros atalhos com Ctrl NÃO pulam a tela
 { const {pg,ctx}=await abre({},{atraso:700});await pg.waitForSelector('#uds-splash');await pg.keyboard.press('Control+k');await pg.waitForTimeout(100);assert.equal(await visivel(pg),true);await ctx.close();console.log('ok atalhos com Ctrl não pulam') }
 // 4) desligada nas configurações: some logo (e não aparece de novo na próxima abertura)
 { const {pg,ctx,t0}=await abre({mostrarLoading:false},{atraso:0});await gone(pg);const dt=Date.now()-t0;assert.ok(dt<1200,'desligada deveria sumir rápido: '+dt);
   await pg.waitForFunction(()=>document.getElementById('s1').textContent.includes('UDS'));
   assert.equal(await pg.evaluate(()=>localStorage.getItem('uds.loading')),'0');
   await pg.reload({waitUntil:'commit'});await pg.waitForFunction(()=>{const e=document.getElementById('uds-splash');return !e||getComputedStyle(e).display==='none'});console.log('ok desligada (',dt,'ms)');await ctx.close() }
 // 5) a opção em Configurações → Aparência liga e desliga e salva
 { const {pg,ctx}=await abre({},{atraso:0});await gone(pg);await pg.keyboard.press('Control+,');await pg.waitForSelector('#ld');
   assert.equal(await pg.$eval('#ld',e=>e.checked),true);await pg.click('#ld');await pg.waitForTimeout(100);
   assert.equal(JSON.parse(await pg.evaluate(()=>window.__salvo)).mostrarLoading,false);assert.equal(await pg.evaluate(()=>localStorage.getItem('uds.loading')),'0');
   await pg.click('#ld');await pg.waitForTimeout(100);assert.equal(JSON.parse(await pg.evaluate(()=>window.__salvo)).mostrarLoading,true);assert.equal(await pg.evaluate(()=>localStorage.getItem('uds.loading')),'1');
   await pg.screenshot({path:'/tmp/loading-3-config.png'});await ctx.close();console.log('ok opção nas configurações') }
 // 6) se o carregamento falhar, a tela ainda some (nada de ficar preso)
 { const {pg,ctx,t0}=await abre({},{atraso:0,quebra:true});await gone(pg);assert.ok(Date.now()-t0<4500);await ctx.close();console.log('ok some mesmo se a configuração falhar') }
 // 7) travado: o limite de segurança libera a tela
 { const {pg,ctx,t0}=await abre({},{atraso:20000});await pg.waitForSelector('#uds-splash');await gone(pg);const dt=Date.now()-t0;assert.ok(dt>=7500&&dt<10500,'limite de 8 s: '+dt);await ctx.close();console.log('ok limite de segurança (',dt,'ms)') }
 // 8) "reduzir movimento": sem animação de traço, cubo já completo
 { const {pg,ctx}=await abre({},{atraso:700,reduzir:true});await pg.waitForSelector('#uds-splash');await pg.waitForTimeout(100);
   assert.equal(await pg.$eval('.sp-f1',e=>getComputedStyle(e).strokeDashoffset),'0px');await ctx.close();console.log('ok reduzir movimento') }
 await br.close();srv.close();console.log('TUDO OK')})().catch(e=>{console.error(e);process.exit(1)});
