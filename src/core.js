// Funções puras do UDS (sem acesso ao disco nem à tela). Por serem puras, são testadas em tests/core.test.js.
(function(root){
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const base=p=>p.split(/[\\/]/).pop();
const par=p=>p.slice(0,Math.max(p.lastIndexOf('/'),p.lastIndexOf('\\')));
const join=(d,n)=>d+(d.includes('\\')?'\\':'/')+n;
const extOf=p=>{const n=base(p).toLowerCase();return n.includes('.')?n.split('.').pop():''};
const LANGS={js:'JavaScript',mjs:'JavaScript',cjs:'JavaScript',jsx:'JSX',ts:'TypeScript',tsx:'TSX',json:'JSON',html:'HTML',htm:'HTML',xml:'XML',svg:'SVG',css:'CSS',scss:'SCSS',md:'Markdown',py:'Python',rs:'Rust',java:'Java',c:'C',h:'C',cpp:'C++',cs:'C#',go:'Go',php:'PHP',rb:'Ruby',sh:'Shell',yml:'YAML',yaml:'YAML',toml:'TOML',sql:'SQL',lua:'Lua',txt:'Texto'};
const langOf=p=>LANGS[extOf(p)]||'Texto';
const ICONS={html:['HTML','#e34f26'],htm:['HTML','#e34f26'],css:['CSS','#2965f1'],scss:['SC','#cd6799'],js:['JS','#f1e05a'],mjs:['JS','#f1e05a'],jsx:['JSX','#61dafb'],ts:['TS','#3178c6'],tsx:['TSX','#3178c6'],json:['{}','#cbcb41'],md:['MD','#519aba'],py:['PY','#3776ab'],rs:['RS','#dea584'],java:['JV','#e76f00'],c:['C','#a8b9cc'],h:['C','#a8b9cc'],cpp:['C++','#00599c'],cs:['C#','#68217a'],go:['GO','#00add8'],php:['PHP','#777bb4'],rb:['RB','#cc342d'],sh:['SH','#89e051'],yml:['YML','#cb171e'],yaml:['YML','#cb171e'],toml:['TML','#9c4221'],sql:['SQL','#e38c00'],txt:['TXT','#8a8a95'],xml:['XML','#f69220'],svg:['SVG','#ffb13b'],png:['PNG','#35b7a3'],jpg:['JPG','#35b7a3'],jpeg:['JPG','#35b7a3'],gif:['GIF','#35b7a3'],webp:['WBP','#35b7a3'],bmp:['BMP','#35b7a3'],ico:['ICO','#35b7a3'],mp3:['MP3','#e8a33d'],wav:['WAV','#e8a33d'],mp4:['MP4','#e05d6f'],pdf:['PDF','#e2574c'],zip:['ZIP','#d9a441'],exe:['EXE','#7a7a85'],obj:['OBJ','#8b6cef'],glb:['GLB','#8b6cef'],stl:['STL','#8b6cef']};
const iconInfo=name=>{const i=ICONS[extOf(name)]||['·','#7a7a85'];const n=parseInt(i[1].slice(1),16),lum=.299*(n>>16)+.587*((n>>8)&255)+.114*(n&255);return{label:i[0],color:i[1],fg:lum>150?'#111':'#fff'}};
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
const api={esc,base,par,join,extOf,langOf,iconInfo,highlight};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.UDSCore=api;
})(typeof window!=='undefined'?window:globalThis);
