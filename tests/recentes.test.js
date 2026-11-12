// Projetos recentes (1.4.2): migração da lista antiga, duplicados, fixados, limite, ordem e texto de tempo.
const test=require('node:test'),assert=require('node:assert');
const R=require('../src/recentes.js');
const nomes=l=>l.map(x=>x.caminho);
test('migra a lista antiga (só textos) para objetos com modo universal',()=>{
 const l=R.normalizar(['C:\\proj\\a','D:/b']);assert.deepEqual(l.map(x=>[x.caminho,x.modo,x.fixado,x.ultimoUso]),[['C:\\proj\\a','universal',false,0],['D:/b','universal',false,0]])});
test('ignora lixo (nulo, número, caminho vazio, objeto sem caminho) e entrada que não é lista',()=>{
 assert.deepEqual(R.normalizar([null,42,'',{},{caminho:' '},undefined,['x']]),[]);assert.deepEqual(R.normalizar(undefined),[]);assert.deepEqual(R.normalizar('texto'),[]);assert.deepEqual(R.normalizar({a:1}),[])});
test('corrige campos inválidos de objetos (modo, fixado, data)',()=>{
 const [x]=R.normalizar([{caminho:'/p',modo:7,fixado:'sim',ultimoUso:'ontem'}]);assert.deepEqual(x,{caminho:'/p',modo:'universal',fixado:false,ultimoUso:0})});
test('caminhos iguais com barra diferente, barra no fim ou maiúsculas (Windows) são o mesmo projeto',()=>{
 assert.equal(R.normalizar(['C:\\Dados\\Proj','c:/dados/proj/','C:/DADOS/PROJ']).length,1);
 assert.equal(R.normalizar(['/home/a/Proj','/home/a/proj']).length,2,'no Linux maiúsculas diferenciam');assert.equal(R.chave('C:\\'),'c:/');assert.equal(R.chave('/'),'/')});
test('duplicado: vale o mais recente e continua fixado se qualquer um estava fixado',()=>{
 const [x,...resto]=R.normalizar([{caminho:'C:/a',ultimoUso:5,fixado:true,modo:'texto'},{caminho:'c:\\A',ultimoUso:9,modo:'universal'}]);assert.equal(resto.length,0);assert.equal(x.ultimoUso,9);assert.equal(x.fixado,true);assert.equal(x.modo,'universal')});
test('ordem: fixados primeiro, depois do mais recente ao mais antigo; empate mantém a ordem de entrada',()=>{
 const l=R.normalizar([{caminho:'a',ultimoUso:1},{caminho:'b',ultimoUso:3},{caminho:'c',ultimoUso:2,fixado:true},{caminho:'d',ultimoUso:3}]);assert.deepEqual(nomes(l),['c','b','d','a'])});
test('adicionar: sobe ao topo, guarda o modo, mantém o fixado e não duplica',()=>{
 let l=R.adicionar([],'/p1','universal',100);l=R.adicionar(l,'/p2','texto',200);assert.deepEqual(nomes(l),['/p2','/p1']);
 l=R.alternarFixado(l,'/p1');l=R.adicionar(l,'/p1','texto',300);assert.equal(l.length,2);assert.equal(l[0].caminho,'/p1');assert.equal(l[0].fixado,true);assert.equal(l[0].modo,'texto');assert.equal(l[0].ultimoUso,300);
 assert.equal(R.adicionar(l,'/p1',undefined,400)[0].modo,'texto','sem modo novo mantém o anterior')});
test('limite de 12 vale só para os não fixados; fixados nunca caem da lista',()=>{
 let l=R.adicionar([],'/fixo','universal',1);l=R.alternarFixado(l,'/fixo');for(let i=0;i<20;i++)l=R.adicionar(l,'/p'+i,'universal',10+i);
 assert.equal(l.length,R.LIMITE+1);assert.equal(l[0].caminho,'/fixo');assert.equal(l[1].caminho,'/p19');assert.ok(!nomes(l).includes('/p0'))});
test('remover, alternar fixado e definir modo agem só no projeto certo',()=>{
 let l=R.normalizar([{caminho:'C:/a',ultimoUso:2},{caminho:'C:/b',ultimoUso:1}]);
 assert.deepEqual(nomes(R.remover(l,'c:\\A\\')),['C:/b']);assert.equal(R.alternarFixado(l,'C:/b')[0].caminho,'C:/b');assert.equal(R.definirModo(l,'C:/b','texto')[1].modo,'texto');assert.equal(R.definirModo(l,'C:/b','')[1].modo,'universal');
 assert.equal(R.remover(l,'C:/nada').length,2);assert.equal(R.alternarFixado(l,'C:/nada').length,2)});
test('não altera a lista recebida',()=>{const l=Object.freeze([Object.freeze({caminho:'/a',modo:'universal',fixado:false,ultimoUso:1})]);R.adicionar(l,'/b','texto',2);R.remover(l,'/a');R.alternarFixado(l,'/a');assert.equal(l.length,1)});
test('nome do projeto',()=>{assert.equal(R.nomeDe('C:\\Users\\Ed\\Meu Projeto'),'Meu Projeto');assert.equal(R.nomeDe('/home/ed/proj/'),'proj');assert.equal(R.nomeDe('C:\\'),'C:');assert.equal(R.nomeDe('/'),'/')});
test('tempo relativo em português',()=>{const A=1e12,t=(ms)=>R.tempoRelativo(A,A-ms),m=60e3,h=60*m,d=24*h;
 assert.equal(R.tempoRelativo(A,0),'');assert.equal(t(10e3),'agora há pouco');assert.equal(t(-5e3),'agora há pouco');assert.equal(t(90e3),'há 1 min');assert.equal(t(5*m),'há 5 min');assert.equal(t(3*h),'há 3 h');assert.equal(t(30*h),'ontem');assert.equal(t(3*d),'há 3 dias');
 assert.equal(t(8*d),'há 1 semana');assert.equal(t(15*d),'há 2 semanas');assert.equal(t(40*d),'há 1 mês');assert.equal(t(100*d),'há 3 meses');assert.equal(t(400*d),'há 1 ano');assert.equal(t(800*d),'há 2 anos')});
