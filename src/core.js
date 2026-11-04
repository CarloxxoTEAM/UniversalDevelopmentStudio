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
const iconColor=theme=>theme==='light'?'preto':'branco';
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
const api={esc,base,par,join,extOf,langOf,iconPath,iconExt,iconColor,ESTILOS,highlight};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.UDSCore=api;
})(typeof window!=='undefined'?window:globalThis);
