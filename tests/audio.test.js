// Testes da leitura de etiquetas e dados técnicos de áudio (1.30). Os arquivos de amostra são reais (ffmpeg)
// e o gabarito (tests/amostras/audio/verdade.json) vem do ffprobe, não do próprio leitor.
const test=require('node:test'),assert=require('node:assert'),fs=require('node:fs'),path=require('node:path');
const M=require('../src/audiometa.js'),DET=require('../src/deteccao.js');
const DIR=path.join(__dirname,'amostras','audio'),V=JSON.parse(fs.readFileSync(path.join(DIR,'verdade.json'),'utf8'));
const ler=n=>new Uint8Array(fs.readFileSync(path.join(DIR,n)));
const perto=(a,b,tol,msg)=>assert.ok(Math.abs(a-b)<=tol,`${msg}: ${a} vs ${b}`);

test('dados técnicos de cada arquivo coincidem com o ffprobe',()=>{
 for(const [nome,v] of Object.entries(V)){const r=M.lerMetadados(ler(nome));assert.ok(r.formato,nome);const t=r.tecnico;
  assert.equal(t.taxa,v.taxa,nome+' taxa');assert.equal(t.canais,v.canais,nome+' canais');perto(t.duracao,v.duracao,0.02,nome+' duração');
  if(v.bits&&/wav|flac/.test(nome))assert.equal(t.bits,v.bits,nome+' bits')}});
test('etiquetas coincidem com o ffprobe (título, artista, álbum, ano, faixa, gênero, comentário)',()=>{
 for(const [nome,v] of Object.entries(V)){const r=M.lerMetadados(ler(nome)),tg=v.tags;
  if(tg.title)assert.equal(r.titulo,tg.title,nome+' título');if(tg.artist)assert.equal(r.artista,tg.artist,nome+' artista');if(tg.album)assert.equal(r.album,tg.album,nome+' álbum');
  if(tg.date)assert.equal(r.ano,tg.date,nome+' ano');if(tg.track)assert.equal(r.faixa,tg.track,nome+' faixa');if(tg.genre)assert.equal(r.genero,tg.genre,nome+' gênero');
  if(tg.comment&&!/mp3|wav/.test(nome))assert.equal(r.comentario,tg.comment,nome+' comentário')}});
test('acentos e idiomas: ID3v2.4 em UTF-8 e ID3v2.3 em UTF-16',()=>{
 assert.equal(M.lerMetadados(ler('v24-mono.mp3')).titulo,'Música Ñandú');assert.equal(M.lerMetadados(ler('com-capa.mp3')).album,'Álbum Um')});
test('capas são extraídas e são PNG de verdade (MP3, FLAC e M4A)',()=>{
 for(const n of['com-capa.mp3','com-capa.flac','com-capa.m4a']){const c=M.lerMetadados(ler(n)).capa;assert.ok(c,n);assert.equal(c.mime,'image/png');assert.deepEqual([...c.dados.subarray(0,8)],[0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A],n);assert.equal(c.dados.length,fs.statSync(path.join(DIR,'capa.png')).size)}
 for(const n of['tags.ogg','so-id3v1.mp3','tags.wav'])assert.equal(M.lerMetadados(ler(n)).capa,null,n)});
test('ID3v1 sozinho é lido (título, artista, álbum, ano, faixa e gênero numérico)',()=>{
 const r=M.lerMetadados(ler('so-id3v1.mp3'));assert.deepEqual([r.titulo,r.artista,r.album,r.ano,r.faixa,r.genero],['Antiga','Velha Guarda','Fita','1999','7','Pop'])});
test('MP3: versão, camada e taxa de bits',()=>{
 const a=M.lerMetadados(ler('com-capa.mp3')).tecnico,b=M.lerMetadados(ler('v24-mono.mp3')).tecnico;
 assert.equal(a.codec,'MPEG-1 Camada III');assert.equal(a.bitrate,128);assert.equal(a.vbr,false);assert.equal(b.codec,'MPEG-2 Camada III');assert.equal(b.bitrate,64)});
test('WAV: codec, bits e taxa de bits',()=>{
 const a=M.lerMetadados(ler('tags.wav')).tecnico,b=M.lerMetadados(ler('24bits.wav')).tecnico;
 assert.equal(a.codec,'PCM 16 bits');assert.equal(a.bitrate,353);assert.equal(b.codec,'PCM 24 bits');assert.equal(b.bits,24);assert.equal(b.bitrate,384)});
test('formato identificado: OGG Vorbis, Opus, M4A (AAC)',()=>{
 assert.equal(M.lerMetadados(ler('tags.ogg')).formato,'OGG Vorbis');assert.equal(M.lerMetadados(ler('tags.opus')).formato,'Opus');assert.equal(M.lerMetadados(ler('com-capa.m4a')).tecnico.codec,'AAC')});
test('a detecção pelo conteúdo e o leitor concordam sobre cada arquivo',()=>{
 const esperado={'com-capa.mp3':'mp3','v24-mono.mp3':'mp3','so-id3v1.mp3':'mp3','com-capa.flac':'flac','tags.ogg':'ogg','tags.opus':'opus','com-capa.m4a':'m4a','tags.wav':'wav','24bits.wav':'wav'};
 for(const [n,id] of Object.entries(esperado)){const d=DET.identificar({nome:'sem-extensao',head:[...ler(n).subarray(0,512)]});assert.equal(d.formato&&d.formato.id,id,n);assert.equal(d.formato.cat,'a',n)}});
test('gêneros ID3: números, parênteses e texto',()=>{
 assert.equal(M.genero('(17)'),'Rock');assert.equal(M.genero('17'),'Rock');assert.equal(M.genero('(13)Pop'),'Pop');assert.equal(M.genero('Samba'),'Samba');assert.equal(M.genero('(200)'),'(200)');assert.equal(M.genero(''),'')});
test('ID3v2.2 (frames de 3 letras) e ID3v2.3 em ISO-8859-1 são lidos',()=>{
 const quadro22=(id,txt)=>{const d=[0,...[...Buffer.from(txt,'latin1')]];return[...Buffer.from(id),0,0,d.length,...d]};
 const f=[...quadro22('TT2','Vovó'),...quadro22('TP1','Zé'),...quadro22('TCO','(9)')];
 const t=f.length,tag=[0x49,0x44,0x33,2,0,0,0,0,(t>>7)&0x7F,t&0x7F,...f];const r=M.lerMetadados(Uint8Array.from([...tag,...new Array(40).fill(0)]));
 assert.equal(r.titulo,'Vovó');assert.equal(r.artista,'Zé');assert.equal(r.genero,'Metal')});
test('picos da forma de onda: valores mínimo e máximo por coluna',()=>{
 const onda=new Float32Array(1000).map((_,i)=>Math.sin(i/1000*Math.PI*2));const p=M.picos([onda],10);
 assert.equal(p.max.length,10);perto(Math.max(...p.max),1,0.02,'máximo');perto(Math.min(...p.min),-1,0.02,'mínimo');assert.ok(p.max[0]>0&&p.min[9]<0);
 const e=M.picos([new Float32Array(0)],5);assert.deepEqual([...e.max],[0,0,0,0,0])});
test('formatarTempo: m:ss e h:mm:ss',()=>{assert.equal(M.formatarTempo(0),'0:00');assert.equal(M.formatarTempo(65.9),'1:05');assert.equal(M.formatarTempo(3725),'1:02:05');assert.equal(M.formatarTempo(NaN),'0:00')});
test('arquivos truncados, vazios ou corrompidos nunca derrubam o leitor',()=>{
 for(const nome of Object.keys(V)){const b=ler(nome);
  for(const n of[0,1,3,4,7,8,11,12,27,64,100,333,1000,2500,Math.floor(b.length/2),b.length-1]){const r=M.lerMetadados(b.subarray(0,Math.min(n,b.length)));assert.equal(typeof r,'object');assert.ok('formato' in r)}
  const lixo=b.slice();for(let i=12;i<Math.min(lixo.length,600);i+=5)lixo[i]=(lixo[i]*31+7)&255;const r=M.lerMetadados(lixo);assert.ok('formato' in r)}
 assert.deepEqual(M.lerMetadados(new Uint8Array(0)),{formato:null});assert.deepEqual(M.lerMetadados(null),{formato:null});assert.equal(M.lerMetadados(Uint8Array.from([1,2,3,4,5,6,7,8,9,10])).formato,null)});

test('arquivo .alac ou .m4b com contêiner M4A não gera aviso de extensão errada',()=>{
 const fs=require('node:fs'),path=require('node:path'),DET=require('../src/deteccao.js');
 const head=[...fs.readFileSync(path.join(__dirname,'amostras','audio','com-capa.m4a')).subarray(0,512)];
 for(const nome of ['a.alac','a.m4b','a.m4a']){const r=DET.identificar({nome,head});assert.equal(r.formato.id,'m4a',nome);assert.equal(r.conflito,false,nome)}
 assert.equal(DET.identificar({nome:'a.mp3',head}).conflito,true)});
