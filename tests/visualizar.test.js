// Visualizar (1.4.2): funções puras da prévia (a janela em si é testada em tests/inicio.navegador.js).
const test=require('node:test'),assert=require('node:assert');
const V=require('../src/visualizar.js'),ext=n=>n.includes('.')?n.split('.').pop().toLowerCase():'';
const e=(name,is_dir=false)=>({name,path:'/p/'+name,is_dir});
test('resumo de pasta: conta pastas, arquivos e separa as imagens',()=>{
 const r=V.resumoPasta([e('a',true),e('b',true),e('x.PNG'),e('y.jpg'),e('z.txt'),e('semext'),e('v.mp4')],ext);assert.deepEqual([r.total,r.pastas,r.arquivos],[7,2,5]);assert.deepEqual(r.imagens.map(i=>i.name),['x.PNG','y.jpg']);
 assert.deepEqual(V.resumoPasta([],ext),{total:0,pastas:0,arquivos:0,imagens:[]})});
test('uma pasta chamada foto.png continua sendo pasta, não imagem',()=>{const r=V.resumoPasta([e('foto.png',true)],ext);assert.equal(r.imagens.length,0);assert.equal(r.pastas,1)});
test('descrição da pasta no singular e no plural',()=>{
 assert.equal(V.descreverPasta({total:0,pastas:0,arquivos:0}),'Pasta vazia');assert.equal(V.descreverPasta({total:1,pastas:0,arquivos:1}),'1 item · 0 pastas · 1 arquivo');assert.equal(V.descreverPasta({total:3,pastas:1,arquivos:2}),'3 itens · 1 pasta · 2 arquivos')});
test('rótulo do tipo',()=>{assert.equal(V.rotuloTipo(e('a',true),ext),'Pasta');assert.equal(V.rotuloTipo(e('m.mp3'),ext),'MP3');assert.equal(V.rotuloTipo(e('LEIAME'),ext),'Arquivo')});
test('limite de linhas do texto em leitura',()=>{
 const t=Array.from({length:V.MAX_LINHAS+50},(_,i)=>'l'+i).join('\n');const r=V.limitarTexto(t);assert.equal(r.cortado,true);assert.equal(r.total,V.MAX_LINHAS+50);assert.equal(r.texto.split('\n').length,V.MAX_LINHAS);
 assert.deepEqual(V.limitarTexto('a\nb'),{texto:'a\nb',cortado:false,total:2});assert.equal(V.limitarTexto(null).cortado,false);assert.equal(V.limitarTexto('a\nb\nc',2).texto,'a\nb')});
test('limites razoáveis',()=>{assert.ok(V.MAX_ITENS>=100&&V.MAX_MINIATURAS>=8&&V.MAX_MINIATURAS<=60);assert.ok(V.IMAGENS.includes('png')&&V.IMAGENS.includes('svg'))});
