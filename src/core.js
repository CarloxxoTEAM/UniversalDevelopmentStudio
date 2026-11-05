// Funções puras do UDS (sem acesso ao disco nem à tela). Por serem puras, são testadas em tests/core.test.js.
(function(root){
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const base=p=>p.split(/[\\/]/).pop();
const par=p=>p.slice(0,Math.max(p.lastIndexOf('/'),p.lastIndexOf('\\')));
const join=(d,n)=>d+(d.includes('\\')?'\\':'/')+n;
const extOf=p=>{const n=base(p).toLowerCase();return n.includes('.')?n.split('.').pop():''};
const LANGS={js:'JavaScript',mjs:'JavaScript',cjs:'JavaScript',jsx:'JSX',ts:'TypeScript',tsx:'TSX',json:'JSON',html:'HTML',htm:'HTML',xml:'XML',svg:'SVG',css:'CSS',scss:'SCSS',md:'Markdown',py:'Python',rs:'Rust',java:'Java',c:'C',h:'C',cpp:'C++',cs:'C#',go:'Go',php:'PHP',rb:'Ruby',sh:'Shell',yml:'YAML',yaml:'YAML',toml:'TOML',sql:'SQL',lua:'Lua',txt:'Texto'};
const langOf=p=>LANGS[extOf(p)]||'Texto';
// Ícones de arquivo (dois estilos, cada um em preto e branco). O índice vem de icones/indice.js.
const IDX=typeof module!=='undefined'&&module.exports?require('./icones/indice.js'):root.UDSIconIndex;
const iconExt=n=>{const b=base(n).toLowerCase();return b.endsWith('.tar.gz')?'tar.gz':extOf(n)};
const ESTILOS=Object.keys(IDX.estilos);
// estilo: 'estilo1' (padrão) ou 'estilo2'; cor: 'branco' (tema escuro) ou 'preto' (tema claro)
function iconPath(name,estilo='estilo1',cor='branco'){
 if(!ESTILOS.includes(estilo))estilo='estilo1';if(cor!=='preto')cor='branco';
 const m=IDX.map[iconExt(name)];
 return m?`icones/${estilo}/${m[0]}/${cor}/${m[1]}.png`:`icones/vazio/${estilo}_vazio_${cor}.svg`}
function folderPath(aberta,estilo='estilo1',cor='branco'){
 if(!ESTILOS.includes(estilo))estilo='estilo1';if(cor!=='preto')cor='branco';
 const [c,n]=aberta?IDX.pastas.aberta:IDX.pastas.fechada;return `icones/${estilo}/${c}/${cor}/${n}.png`}
const iconColor=theme=>theme==='light'?'preto':'branco';

// ---- Temas (1.10): lidos de themes/<pasta>/theme.json ----
// chave do theme.json -> variável CSS usada pela interface
const THEME_KEYS={'barra-superior':'--bg0','painel':'--bg1','editor':'--ed','borda':'--bd','texto':'--tx','texto-secundario':'--tx2','destaque':'--ac','selecao':'--sel','hover':'--hov','degrade-inicio':'--g1','degrade-fim':'--g2','sintaxe-palavra-chave':'--kw','sintaxe-texto':'--st','sintaxe-comentario':'--cm','sintaxe-numero':'--nu','sintaxe-tag':'--tg'};
// cores padrão de cada tipo: qualquer cor que o tema não definir vem daqui
const BASE_TEMAS={
 escuro:{'barra-superior':'#09090b','painel':'#0d0d10','editor':'#0b0b0d','borda':'#1a1a1f','texto':'#c9c9d1','texto-secundario':'#6c6c76','destaque':'#2f6df0','selecao':'#14264a','hover':'#15151a','degrade-inicio':'#ff8a3d','degrade-fim':'#ff3d6e','sintaxe-palavra-chave':'#c586c0','sintaxe-texto':'#ce9178','sintaxe-comentario':'#5f8a50','sintaxe-numero':'#b5cea8','sintaxe-tag':'#569cd6'},
 claro:{'barra-superior':'#ececef','painel':'#f5f5f7','editor':'#ffffff','borda':'#dcdce1','texto':'#2b2b33','texto-secundario':'#7a7a85','destaque':'#1f5fe0','selecao':'#d4e2fb','hover':'#e8e8ec','degrade-inicio':'#ff8a3d','degrade-fim':'#ff3d6e','sintaxe-palavra-chave':'#af00db','sintaxe-texto':'#a31515','sintaxe-comentario':'#008000','sintaxe-numero':'#098658','sintaxe-tag':'#0000ff'}};
const TEMAS_EMBUTIDOS=[{id:'uds-escuro',nome:'UDS Escuro',autor:'UDS',versao:'1.0.0',tipo:'escuro',cores:{...BASE_TEMAS.escuro}},{id:'uds-claro',nome:'UDS Claro',autor:'UDS',versao:'1.0.0',tipo:'claro',cores:{...BASE_TEMAS.claro}}];
const HEX=/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
// Valida o conteúdo de um theme.json. Devolve {ok:true,tema,avisos} ou {ok:false,erro}.
function validarTema(obj){
 if(!obj||typeof obj!=='object'||Array.isArray(obj))return{ok:false,erro:'o arquivo precisa ser um objeto JSON'};
 if(obj.formato!==undefined&&obj.formato!==1)return{ok:false,erro:`formato ${obj.formato} não suportado (use 1)`};
 if(typeof obj.id!=='string'||!/^[a-z0-9][a-z0-9-]{1,40}$/.test(obj.id))return{ok:false,erro:'"id" é obrigatório: 2 a 41 caracteres, só letras minúsculas, números e hífen'};
 if(typeof obj.nome!=='string'||!obj.nome.trim()||obj.nome.length>40)return{ok:false,erro:'"nome" é obrigatório (até 40 caracteres)'};
 if(obj.tipo!=='escuro'&&obj.tipo!=='claro')return{ok:false,erro:'"tipo" precisa ser "escuro" ou "claro"'};
 for(const k of['autor','versao'])if(obj[k]!==undefined&&(typeof obj[k]!=='string'||obj[k].length>60))return{ok:false,erro:`"${k}" precisa ser um texto de até 60 caracteres`};
 if(obj.cores!==undefined&&(typeof obj.cores!=='object'||obj.cores===null||Array.isArray(obj.cores)))return{ok:false,erro:'"cores" precisa ser um objeto'};
 const avisos=[],cores={...BASE_TEMAS[obj.tipo]};
 for(const [k,v] of Object.entries(obj.cores||{})){
  if(!(k in THEME_KEYS)){avisos.push(`cor desconhecida ignorada: "${k}"`);continue}
  if(typeof v!=='string'||!HEX.test(v))return{ok:false,erro:`a cor "${k}" é inválida: use o formato #rgb, #rrggbb ou #rrggbbaa`};
  cores[k]=v}
 return{ok:true,avisos,tema:{id:obj.id,nome:obj.nome.trim(),autor:obj.autor||'',versao:obj.versao||'',tipo:obj.tipo,cores}}}
function lerTema(texto){let o;try{o=JSON.parse(texto)}catch(e){return{ok:false,erro:'JSON inválido: '+e.message}}return validarTema(o)}
const cssVars=tema=>Object.fromEntries(Object.entries(tema.cores).map(([k,v])=>[THEME_KEYS[k],v]));
// tema -> valores usados pelo resto do programa
const temaModo=tema=>tema.tipo==='claro'?'light':'dark';
const KW='function|const|let|var|return|if|else|for|while|do|switch|case|break|continue|import|from|export|default|class|extends|new|interface|type|enum|async|await|try|catch|finally|throw|def|elif|in|of|is|not|and|or|None|True|False|true|false|null|undefined|this|self|void|int|string|boolean|public|private|static|final|package|fn|let|mut|pub|use|struct|impl|match|mod|func|go|defer|namespace|using';
const HASH=new Set('py,rb,sh,yml,yaml,toml,pl,r'.split(',')),DASH=new Set(['sql','lua','hs']),MARK=new Set('html,htm,xml,svg'.split(','));
const cls=m=>m[1]?'c':m[2]?'s':m[3]?'k':'n';
function highlight(s,ext){
 if(s.length>300000||ext=='md'||ext=='txt'||ext=='')return esc(s);
 let re,pick=cls;
 if(MARK.has(ext)){re=/(<!--[\s\S]*?-->)|("[^"\n]*"|'[^'\n]*')|(<\/?[A-Za-z][\w:-]*)|(\s[\w:-]+(?==))/g;pick=m=>m[1]?'c':m[2]?'s':m[3]?'t':'n'}
 else{const cm=HASH.has(ext)?'#.*':DASH.has(ext)?'--.*':'\\/\\/.*|\\/\\*[\\s\\S]*?\\*\\/';
  re=new RegExp('('+cm+')|("(?:\\\\.|[^"\\\\\\n])*"|\'(?:\\\\.|[^\'\\\\\\n])*\'|`[^`]*`)|\\b('+KW+')\\b|\\b(\\d+\\.?\\d*)\\b','g')}
 let o='',i=0,m;while((m=re.exec(s))){if(m[0]==='')break;o+=esc(s.slice(i,m.index))+`<i class="${pick(m)}">${esc(m[0])}</i>`;i=re.lastIndex}
 return o+esc(s.slice(i))}
const api={esc,base,par,join,extOf,langOf,iconPath,folderPath,iconExt,iconColor,THEME_KEYS,BASE_TEMAS,TEMAS_EMBUTIDOS,validarTema,lerTema,cssVars,temaModo,ESTILOS,highlight};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.UDSCore=api;
})(typeof window!=='undefined'?window:globalThis);
