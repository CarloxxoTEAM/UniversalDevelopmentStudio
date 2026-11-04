// Testes automáticos básicos (versão 0.50). Rodar: npm test
const test=require('node:test'),assert=require('node:assert');
const C=require('../src/core.js');
test('extOf reconhece extensões em minúsculas',()=>{assert.equal(C.extOf('C:\\a\\Foto.PNG'),'png');assert.equal(C.extOf('/x/Makefile'),'')});
test('base, par e join funcionam com / e \\',()=>{assert.equal(C.base('a/b/c.txt'),'c.txt');assert.equal(C.base('a\\b\\c.txt'),'c.txt');assert.equal(C.par('a\\b\\c.txt'),'a\\b');assert.equal(C.join('C:\\p','x.js'),'C:\\p\\x.js');assert.equal(C.join('/p','x.js'),'/p/x.js')});
test('langOf identifica a linguagem pela extensão',()=>{assert.equal(C.langOf('a.ts'),'TypeScript');assert.equal(C.langOf('a.xyz'),'Texto')});
test('esc protege HTML',()=>assert.equal(C.esc('<a href="x">&'),'&lt;a href=&quot;x&quot;&gt;&amp;'));
test('highlight destaca palavras-chave, strings, números e comentários',()=>{const h=C.highlight('const a = "x"; // oi\nlet n = 42','js');assert.match(h,/<i class="k">const<\/i>/);assert.match(h,/<i class="s">&quot;x&quot;<\/i>/);assert.match(h,/<i class="c">\/\/ oi<\/i>/);assert.match(h,/<i class="n">42<\/i>/)});
test('highlight não deixa HTML do arquivo vazar',()=>{const h=C.highlight('<script>alert(1)</script>','txt');assert.ok(!h.includes('<script>'))});
test('highlight de HTML marca tags',()=>assert.match(C.highlight('<div class="a">','html'),/<i class="t">&lt;div<\/i>/));
test('highlight usa # como comentário em Python',()=>assert.match(C.highlight('x = 1 # nota','py'),/<i class="c"># nota<\/i>/));

// ---- Ícones (dois estilos x preto/branco) ----
const fs=require('node:fs'),path=require('node:path'),IDX=require('../src/icones/indice.js');
const ICON_DIR=path.join(__dirname,'..','src');
test('iconPath usa o Estilo 1 branco por padrão e escolhe preto no tema claro',()=>{
 assert.equal(C.iconPath('a.js'),'icones/estilo1/02_programacao_scripts/branco/js.png');
 assert.equal(C.iconPath('a.js','estilo1',C.iconColor('light')),'icones/estilo1/02_programacao_scripts/preto/js.png');
 assert.equal(C.iconPath('a.js','estilo2'),'icones/estilo2/02_programacao_scripts/branco/js.png')});
test('iconPath resolve aliases, maiúsculas e .tar.gz',()=>{
 assert.match(C.iconPath('Foto.JPEG'),/05_imagens\/branco\/jpg\.png$/);assert.match(C.iconPath('x.yml'),/yaml\.png$/);assert.match(C.iconPath('x.tar.gz'),/10_compactados_discos\/branco\/tgz\.png$/);assert.match(C.iconPath('m.glb'),/gltf\.png$/)});
test('iconPath usa o ícone vazio para extensão desconhecida e estilo inválido cai no padrão',()=>{
 assert.equal(C.iconPath('a.xyz'),'icones/vazio/estilo1_vazio_branco.svg');assert.equal(C.iconPath('a.xyz','estilo2','preto'),'icones/vazio/estilo2_vazio_preto.svg');assert.match(C.iconPath('a.js','nada'),/estilo1/)});
test('todo ícone do índice existe nos 2 estilos e nas 2 cores',()=>{
 for(const [ext,[cat,nome]] of Object.entries(IDX.map))for(const e of C.ESTILOS)for(const cor of ['preto','branco'])assert.ok(fs.existsSync(path.join(ICON_DIR,C.iconPath('x.'+ext,e,cor))),`faltando: ${ext} ${e} ${cor}`)});
test('nenhum ícone fica sem uso (exceto os reservados)',()=>{
 const usados=new Set(Object.values(IDX.map).map(m=>m[1])),reais=new Set();
 for(const cat of fs.readdirSync(path.join(ICON_DIR,'icones','estilo1')))for(const f of fs.readdirSync(path.join(ICON_DIR,'icones','estilo1',cat,'preto')))reais.add(f.replace('.png',''));
 assert.equal(reais.size,145);for(const n of reais)if(!IDX.reservados.includes(n))assert.ok(usados.has(n),'sem extensão: '+n)});
test('os dois estilos e as duas cores têm exatamente os mesmos arquivos',()=>{
 const lista=(e,c)=>fs.readdirSync(path.join(ICON_DIR,'icones',e)).flatMap(cat=>fs.readdirSync(path.join(ICON_DIR,'icones',e,cat,c)).map(f=>cat+'/'+f)).sort().join();
 const ref=lista('estilo1','preto');for(const e of C.ESTILOS)for(const c of ['preto','branco'])assert.equal(lista(e,c),ref,e+' '+c)});
test('todas as extensões do documento de formatos têm ícone',()=>{
 const exts='html,htm,xml,xhtml,css,scss,sass,less,md,markdown,json,yml,yaml,toml,ini,svg,tex,sgml,js,mjs,cjs,ts,tsx,jsx,py,pyw,pyc,ipynb,java,class,jar,c,h,cpp,hpp,cc,cxx,cs,php,phtml,rb,go,rs,swift,kt,kts,dart,r,m,pl,scala,lua,ex,exs,hs,clj,erl,asm,s,sh,bash,zsh,ps1,bat,cmd,sql,graphql,gql,wasm,mp3,wav,flac,aac,ogg,oga,m4a,opus,wma,aiff,aif,alac,mid,midi,amr,pcm,mp4,m4v,mkv,avi,mov,webm,wmv,flv,f4v,mpeg,mpg,3gp,ogv,m2ts,vob,jpg,jpeg,png,gif,webp,avif,tif,tiff,bmp,heic,heif,ico,psd,psb,ai,eps,indd,raw,cr2,cr3,nef,arw,dng,obj,mtl,fbx,stl,gltf,glb,blend,step,stp,iges,igs,dae,3ds,max,ma,mb,c4d,dxf,dwg,ply,usd,usda,usdc,usdz,wrl,x3d,sqlite,db,db3,bson,accdb,mdb,parquet,ttf,otf,woff,woff2,eot,pdf,doc,docx,xls,xlsx,ppt,pptx,odt,ods,odp,txt,rtf,epub,azw3,mobi,zip,rar,7z,tar,tgz,gz,bz2,iso,img,exe,msi,apk,xapk,aab,dmg,pkg,deb,rpm,appimage,bin,dll,so,dylib'.split(',');
 const sem=exts.filter(e=>!C.iconPath('x.'+e).startsWith('icones/estilo1/'));assert.deepEqual(sem,[])});
