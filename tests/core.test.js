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
test('iconInfo devolve rótulo e cor, e um padrão para extensões desconhecidas',()=>{assert.equal(C.iconInfo('a.js').label,'JS');assert.equal(C.iconInfo('a.zzz').label,'·')});
