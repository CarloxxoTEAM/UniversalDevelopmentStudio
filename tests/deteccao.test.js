// Testes da identificação de arquivos pelo conteúdo (1.20). Rodar: npm test
const test=require('node:test'),assert=require('node:assert'),fs=require('node:fs'),path=require('node:path');
const D=require('../src/deteccao.js'),C=require('../src/core.js'),IDX=require('../src/icones/indice.js');
const AM=path.join(__dirname,'amostras'),RAIZ=path.join(__dirname,'..');
const cab=f=>[...fs.readFileSync(f).subarray(0,512)];
const amostra=n=>cab(path.join(AM,n));
const id=(nome,head,texto)=>D.identificar({nome,head,texto});
const bytes=(...p)=>{const o=[];for(const x of p)if(typeof x==='string')for(const c of x)o.push(c.charCodeAt(0));else if(Array.isArray(x))o.push(...x);else o.push(x);while(o.length<512)o.push(0);return o};

test('arquivos reais são reconhecidos pelo conteúdo, mesmo sem extensão',()=>{
 const casos={png:'png',jpg:'jpg',gif:'gif',webp:'webp',bmp:'bmp',tiff:'tiff',ico:'ico',pdf:'pdf',wav:'wav',gz:'gz',bz2:'bz2',tar:'tar',zip:'zip',sqlite:'sqlite',epub:'epub',odt:'odt',docx:'docx',xlsx:'xlsx',jar:'jar'};
 for(const [ext,esperado] of Object.entries(casos)){const r=id('arquivo-sem-extensao',amostra('amostra.'+ext));assert.equal(r.via,'conteudo',ext);assert.equal(r.formato.id,esperado,ext)}});
test('um PNG chamado foto.txt é PNG e a extensão é marcada como conflito',()=>{
 const r=id('foto.txt',amostra('amostra.png'));assert.equal(r.formato.id,'png');assert.equal(r.conflito,true);assert.equal(r.ext,'png');assert.equal(r.icone,'png')});
test('extensão compatível não gera conflito (jpeg/jpg, docx/xlsx dentro de ZIP, jar)',()=>{
 assert.equal(id('a.jpeg',amostra('amostra.jpg')).conflito,false);assert.equal(id('a.jpg',amostra('amostra.jpg')).conflito,false);
 assert.equal(id('a.docx',amostra('amostra.docx')).conflito,false);assert.equal(id('a.xlsx',amostra('amostra.xlsx')).conflito,false);
 assert.equal(id('a.apk',amostra('amostra.jar')).conflito,false);assert.equal(id('a.zip',amostra('amostra.zip')).conflito,false)});
test('Office dentro de ZIP: usa a extensão do arquivo para escolher entre docx, xlsx e pptx',()=>{
 assert.equal(id('x.pptx',amostra('amostra.docx')).icone,'ppt');assert.equal(id('x.xlsx',amostra('amostra.xlsx')).icone,'xls');assert.equal(id('semnome',amostra('amostra.xlsx')).formato.id,'xlsx')});
test('assinaturas montadas à mão: vídeo, áudio, compactados, fontes, bancos e 3D',()=>{
 const casos=[
  ['mp4',bytes([0,0,0,24],'ftypisom')],['mov',bytes([0,0,0,20],'ftypqt  ')],['m4a',bytes([0,0,0,20],'ftypM4A ')],['3gp',bytes([0,0,0,20],'ftyp3gp4')],['heic',bytes([0,0,0,24],'ftypheic')],['avif',bytes([0,0,0,24],'ftypavif')],
  ['mp3',bytes('ID3',3,0)],['mp3',bytes([0xFF,0xFB,0x90,0x00])],['aac',bytes([0xFF,0xF1,0x50,0x80])],['flac',bytes('fLaC',0)],['ogg',bytes('OggS',[0,2],'vorbis')],['opus',bytes('OggS',new Array(20).fill(0),'OpusHead')],['midi',bytes('MThd')],['amr',bytes('#!AMR\n')],['aiff',bytes('FORM',[0,0,0,0],'AIFF')],['avi',bytes('RIFF',[0,0,0,0],'AVI ')],
  ['webm',bytes([0x1A,0x45,0xDF,0xA3],new Array(20).fill(0),'webm')],['mkv',bytes([0x1A,0x45,0xDF,0xA3],new Array(20).fill(0),'matroska')],['flv',bytes('FLV',1)],['mpeg',bytes([0,0,1,0xBA])],['wmv',bytes([0x30,0x26,0xB2,0x75,0x8E,0x66,0xCF,0x11])],
  ['rar',bytes('Rar!',[0x1A,7,0])],['7z',bytes([0x37,0x7A,0xBC,0xAF,0x27,0x1C,0,4])],['psd',bytes('8BPS')],['eps',bytes('%!PS-Adobe-3.0 EPSF-3.0')],
  ['otf',bytes('OTTO',[0,10])],['woff',bytes('wOFF',[0,1,0,0])],['woff2',bytes('wOF2','OTTO')],['ttf',bytes([0,1,0,0,0,12,0,0])],
  ['parquet',bytes('PAR1',[0,0,0,0])],['accdb',bytes([0,1,0,0],'Standard ACE DB')],['glb',bytes('glTF',[2,0,0,0])],['fbx',bytes('Kaydara FBX Binary  ',0)],['blend',bytes('BLENDER-v300')],['dwg',bytes('AC1032')],['wasm',bytes([0,0x61,0x73,0x6D,1,0,0,0])],
  ['deb',bytes('!<arch>\ndebian-binary')],['rpm',bytes([0xED,0xAB,0xEE,0xDB])],['pkg',bytes('xar!')],['ole',bytes([0xD0,0xCF,0x11,0xE0,0xA1,0xB1,0x1A,0xE1])]];
 for(const [esperado,head] of casos)assert.equal(id('x',head).formato.id,esperado,esperado)});
test('executáveis: EXE x DLL (cabeçalho PE), ELF, Mach-O e Java .class',()=>{
 const pe=car=>{const h=new Array(512).fill(0);h[0]=0x4D;h[1]=0x5A;h[0x3C]=0x80;h.splice(0x80,4,0x50,0x45,0,0);h[0x80+22]=car&255;h[0x80+23]=car>>8;return h};
 assert.equal(id('x',pe(0x0102)).formato.id,'exe');assert.equal(id('x',pe(0x2102)).formato.id,'dll');assert.equal(id('x.msi',pe(0x0102)).conflito,false);
 assert.equal(id('texto',bytes('MZ nao e um executavel')).formato,null);
 assert.equal(id('x',bytes([0x7F],'ELF',[2,1,1])).formato.id,'elf');assert.equal(id('libx.so',bytes([0x7F],'ELF',[2,1,1])).conflito,false);
 assert.equal(id('x',bytes([0xCA,0xFE,0xBA,0xBE,0,0,0,52])).formato.id,'class');assert.equal(id('x',bytes([0xCA,0xFE,0xBA,0xBE,0,0,0,2])).formato.id,'macho');assert.equal(id('x',bytes([0xCF,0xFA,0xED,0xFE])).formato.id,'macho')});
test('texto: shebang, PHP, HTML, XML, SVG, JSON, SQL, MySQL, YAML, LaTeX, OBJ e STL',()=>{
 const t=(txt)=>id('arquivo',undefined,txt).formato;
 assert.equal(t('#!/bin/bash\necho oi').id,'sh');assert.equal(t('#!/usr/bin/env python3\nprint(1)').ext,'py');assert.equal(t('#!/usr/bin/env node\n1').ext,'js');assert.equal(t('#!/usr/bin/perl\n').ext,'pl');
 assert.equal(t('<?php echo 1;').id,'php');assert.equal(t('<!DOCTYPE html><html></html>').id,'html');assert.equal(t('<?xml version="1.0"?><a/>').id,'xml');assert.equal(t('<?xml version="1.0"?><svg xmlns="x"/>').id,'svg');assert.equal(t('<svg width="1"/>').id,'svg');
 assert.equal(t('{"a":1}').id,'json');assert.equal(t('[1,2]').id,'json');assert.equal(t('{ quebrado'),null);
 assert.equal(t('CREATE TABLE t (a int);').id,'sql');assert.equal(t('-- MySQL dump 10.13\nSET x=1;').id,'mysql');assert.equal(t('---\ntitle: x\n').id,'yaml');assert.equal(t('\\documentclass{article}').id,'tex');
 assert.equal(t('v 0 0 0\nv 1 0 0\nv 0 1 0\nf 1 2 3\n').id,'obj');assert.equal(t('solid x\nfacet normal 0 0 1\n').id,'stl');assert.equal(t('ply\nformat ascii 1.0\n').id,'ply');
 assert.equal(t('apenas um texto qualquer'),null)});
test('Lottie é um JSON com camadas e animação; JSON comum continua JSON',()=>{
 assert.equal(id('anim.json',undefined,'{"v":"5.7","fr":30,"ip":0,"op":60,"w":100,"h":100,"layers":[]}').formato.id,'lottie');
 assert.equal(id('anim.json',undefined,'{"v":"5.7","fr":30,"ip":0,"op":60,"w":100,"h":100,"layers":[]}').icone,'lottie');
 assert.equal(id('dados.json',undefined,'{"layers":"x"}').formato.id,'json');assert.equal(id('dados.json',undefined,'{"a":1}').conflito,false)});
test('MySQL: dump em .sql usa o ícone do MySQL; .sql comum continua SQL',()=>{
 const r=id('backup.sql',undefined,'-- MySQL dump 10.13\nCREATE TABLE t (a int);');assert.equal(r.formato.id,'mysql');assert.equal(r.icone,'mysql');assert.equal(C.iconPathByName(r.icone),'icones/estilo1/07_banco_de_dados/branco/mysql.png');
 assert.equal(id('q.sql',undefined,'CREATE TABLE t (a int);').formato.id,'sql')});
test('texto só é detectado quando a extensão não diz nada: extensão conhecida vence',()=>{
 assert.equal(id('a.py',undefined,'#!/bin/bash\n').via,'extensao');assert.equal(id('a.js',undefined,'<?php ?>').via,'extensao');
 assert.equal(id('notas.txt',undefined,'#!/bin/bash\necho').ext,'sh');assert.equal(id('semextensao',undefined,'#!/bin/bash\n').via,'conteudo')});
test('texto desconhecido e sem extensão não vira nada; extensão desconhecida fica "desconhecido"',()=>{
 const r=id('LEIAME',undefined,'texto livre');assert.equal(r.formato,null);assert.equal(r.via,'desconhecido');assert.equal(id('a.xyz',[1,2,3]).via,'desconhecido');assert.equal(id('a.png',[1,2,3]).via,'extensao')});
test('o cabeçalho de texto também é lido quando só os primeiros bytes estão disponíveis',()=>{
 const head=[...Buffer.from('<svg width="10"></svg>')];assert.equal(id('figura',head).formato.id,'svg');assert.equal(id('bin',[0,1,2,255,254]).formato,null)});
test('nenhum arquivo de código do projeto é confundido com um formato binário',()=>{
 const pastas=['src','src/visualizadores','tests','scripts','themes/uds-escuro','themes/exemplo-oceano','ReadMe','.github/workflows','src-tauri/src'];let n=0;
 for(const p of pastas){const dir=path.join(RAIZ,p);for(const f of fs.readdirSync(dir,{withFileTypes:true}).filter(x=>x.isFile()&&!/\.png$/.test(x.name))){const c=cab(path.join(dir,f.name));
  const r=id('sem-extensao',c);assert.ok(r.formato===null||r.formato.texto===true,`${p}/${f.name} detectado como ${r.formato&&r.formato.id}`);n++}}
 assert.ok(n>15,'poucos arquivos conferidos: '+n)});
test('os ícones PNG do próprio projeto são reconhecidos como PNG',()=>{
 let n=0;for(const e of ['estilo1','estilo2'])for(const cat of fs.readdirSync(path.join(RAIZ,'src','icones',e)).slice(0,4)){const dir=path.join(RAIZ,'src','icones',e,cat,'branco');for(const f of fs.readdirSync(dir)){assert.equal(id(f,cab(path.join(dir,f))).formato.id,'png');n++}}assert.ok(n>20)});
test('todo ícone citado pela detecção existe nos 2 estilos e nas 2 cores',()=>{
 const nomes=new Set();
 for(const f of D.BIN){}
 const amostras=[...Object.values(IDX.map).map(m=>m[1])];
 const textos=['#!/bin/bash','<?php','<html>','<?xml ?><a/>','{"a":1}','CREATE TABLE t(a int)','-- MySQL dump','---\na: 1','\\documentclass{a}','v 0 0 0\nv 1 0 0\nv 0 1 0\nf 1 2 3','ply\n','solid a\nfacet normal 0'];
 for(const t of textos){const r=id('x',undefined,t);if(r.formato)nomes.add(r.formato.icone)}
 nomes.add('mysql');nomes.add('lottie');nomes.add('gltf');nomes.add('java');
 for(const n of nomes)for(const e of C.ESTILOS)for(const cor of ['preto','branco'])assert.ok(fs.existsSync(path.join(RAIZ,'src',C.iconPathByName(n,e,cor))),`ícone faltando: ${n} ${e} ${cor}`)});

test('texto comum que começa com letras de uma assinatura não é confundido com binário',()=>{
 for(const txt of['OTTO was here','ID3 tags explained','BLENDER notes','AC1000 lista de pecas','MZ e um nome','PAR1 e PAR2','true story','glTF spec','wOFF is a format','BZh is not bz2','Rar! hello']){
  const r=id('x',[...Buffer.from(txt)]);assert.ok(r.formato===null||r.formato.texto===true,`${txt} -> ${r.formato&&r.formato.id}`)}});
test('Lottie em .json e dump do MySQL em .sql não geram aviso de conflito',()=>{
 assert.equal(id('a.json',undefined,'{"v":"5","fr":30,"ip":0,"op":9,"w":1,"h":1,"layers":[]}').conflito,false);
 assert.equal(id('b.sql',undefined,'-- MySQL dump 10.13\nSET a=1;').conflito,false)});
test('shebang devolve o nome da linguagem',()=>{assert.equal(id('x',undefined,'#!/usr/bin/env python3\n').nome,'Python');assert.equal(id('x',undefined,'#!/bin/bash\n').nome,'Shell Script')});
