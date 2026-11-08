// Identificação de arquivos pelo conteúdo (1.20). Funções puras: recebem os primeiros bytes e/ou o texto.
// Regra de ouro: assinatura binária forte vence a extensão; detecção por texto só vale quando a extensão
// não diz nada (sem extensão, desconhecida, .txt, .json ou .sql).
(function(root){
const IDX=typeof module!=='undefined'&&module.exports?require('./icones/indice.js'):root.UDSIconIndex;
const extOf=n=>{const b=n.split(/[\\/]/).pop().toLowerCase();return b.includes('.')?b.split('.').pop():''};
const iconeDeExt=e=>IDX.map[e]?IDX.map[e][1]:null;
const A=(b,i,s)=>{if(b.length<i+s.length)return false;for(let k=0;k<s.length;k++)if(b[i+k]!==s.charCodeAt(k))return false;return true};
const asc=(b,i,j)=>{let o='';for(let k=i;k<Math.min(j,b.length);k++)o+=String.fromCharCode(b[k]);return o};
const has=(b,s)=>{for(let i=0;i<=b.length-s.length;i++)if(A(b,i,s))return true;return false};
const naoTexto=(b,i,j)=>{for(let k=i;k<Math.min(j,b.length);k++)if(b[k]<9||b[k]>126)return true;return false};
const U32=(b,i)=>((b[i]<<24)|(b[i+1]<<16)|(b[i+2]<<8)|b[i+3])>>>0;
// id, nome, categoria (a=áudio v=vídeo i=imagem d=3D b=banco f=fonte t=documento z=compactado x=executável), extensão canônica, mime
const D=(id,nome,cat,ext,mime,extra={})=>({id,nome,cat,ext,icone:iconeDeExt(ext)||ext,mime:mime||'application/octet-stream',compat:[],semConflito:[],vis:null,...extra});
const ZIPFAM=['zip','jar','apk','xapk','aab','docx','xlsx','pptx','epub','odt','ods','odp','usdz'];
const MP4B={heic:['heic','heix','hevc','heim','heis','mif1','msf1'],avif:['avif','avis']};
function ftyp(b){const br=asc(b,8,12);
 if(MP4B.heic.includes(br))return D('heic','HEIC / HEIF','i','heic','image/heic');
 if(MP4B.avif.includes(br))return D('avif','AVIF','i','avif','image/avif');
 if(br==='crx ')return D('raw','RAW (Canon CR3)','i','raw','image/x-canon-cr3',{compat:['cr3']});
 if(br==='qt  ')return D('mov','QuickTime (MOV)','v','mov','video/quicktime',{vis:'1.40'});
 if(br==='M4A '||br==='M4B ')return D('m4a','M4A','a','m4a','audio/mp4',{});
 if(br.startsWith('3g'))return D('3gp','3GP','v','3gp','video/3gpp',{vis:'1.40'});
 return D('mp4','MP4','v','mp4','video/mp4',{vis:'1.40',compat:['m4v','mov','m4a','3gp']})}
function zip(b){const nl=b[26]|(b[27]<<8),nome=asc(b,30,30+nl);
 if(nome==='mimetype'){const i=30+nl+(b[28]|(b[29]<<8)),mt=asc(b,i,i+70);
  if(mt.startsWith('application/epub+zip'))return D('epub','EPUB','t','epub','application/epub+zip');
  const m=mt.match(/^application\/vnd\.oasis\.opendocument\.(text|spreadsheet|presentation)/);
  if(m){const e={text:'odt',spreadsheet:'ods',presentation:'odp'}[m[1]];return D(e,'OpenDocument','t',e,'application/vnd.oasis.opendocument.'+m[1])}}
 if(nome.startsWith('[Content_Types].xml')||nome==='_rels/.rels'||nome.startsWith('docProps/')){
  const e=has(b,'word/')?'docx':has(b,'xl/')?'xlsx':has(b,'ppt/')?'pptx':'docx';
  return D(e,'Documento Office (OOXML)','t',e,'application/zip',{compat:['docx','xlsx','pptx'],vis:'1.90'})}
 if(nome.startsWith('META-INF/'))return D('jar','JAR / APK (ZIP)','x','jar','application/java-archive',{compat:['jar','apk','xapk','aab'],vis:'1.90'});
 if(nome==='AndroidManifest.xml'||nome==='classes.dex')return D('apk','Android (APK)','x','apk','application/vnd.android.package-archive',{vis:'1.90'});
 return D('zip','ZIP','z','zip','application/zip',{compat:ZIPFAM,vis:'1.90'})}
function pe(b){const o=b[0x3C]|(b[0x3D]<<8);if(o<64||o+24>b.length||!A(b,o,'PE\0\0'))return null;
 return(b[o+22]|(b[o+23]<<8))&0x2000?D('dll','Biblioteca DLL','x','dll'):D('exe','Executável Windows','x','exe',null,{compat:['msi']})}
// Detectores binários, em ordem. Cada um devolve um descritor ou null.
const BIN=[
 b=>b[0]===0x89&&A(b,1,'PNG\r\n')&&D('png','PNG','i','png','image/png'),
 b=>b[0]===0xFF&&b[1]===0xD8&&b[2]===0xFF&&D('jpg','JPEG','i','jpg','image/jpeg',{compat:['jpeg']}),
 b=>(A(b,0,'GIF87a')||A(b,0,'GIF89a'))&&D('gif','GIF','i','gif','image/gif'),
 b=>A(b,0,'RIFF')&&A(b,8,'WEBP')&&D('webp','WebP','i','webp','image/webp'),
 b=>A(b,0,'RIFF')&&A(b,8,'WAVE')&&D('wav','WAV','a','wav','audio/wav',{}),
 b=>A(b,0,'RIFF')&&A(b,8,'AVI ')&&D('avi','AVI','v','avi','video/x-msvideo',{vis:'1.40'}),
 b=>A(b,0,'BM')&&b.length>14&&b[6]===0&&b[7]===0&&b[8]===0&&b[9]===0&&[12,40,52,56,64,108,124].includes(b[14])&&D('bmp','BMP','i','bmp','image/bmp'),
 b=>b[0]===0&&b[1]===0&&b[2]===1&&b[3]===0&&b[4]>0&&b[5]===0&&b[9]===0&&b.length>=22&&D('ico','ICO','i','ico','image/x-icon'),
 b=>((A(b,0,'II')&&b[2]===42&&b[3]===0)||(A(b,0,'MM')&&b[2]===0&&b[3]===42))&&D('tiff','TIFF','i','tiff','image/tiff',{compat:['tif','cr2','dng','nef','arw','raw']}),
 b=>A(b,0,'8BPS')&&D('psd','Photoshop (PSD)','i','psd',null,{compat:['psb']}),
 b=>A(b,0,'%PDF-')&&D('pdf','PDF','t','pdf','application/pdf',{vis:'1.70',compat:['ai']}),
 b=>(A(b,0,'%!PS-Adobe')||(b[0]===0xC5&&b[1]===0xD0&&b[2]===0xD3&&b[3]===0xC6))&&D('eps','EPS','i','eps','application/postscript'),
 b=>A(b,4,'ftyp')&&ftyp(b),
 b=>A(b,0,'fLaC')&&(b[4]===0||b[4]===0x80)&&D('flac','FLAC','a','flac','audio/flac',{}),
 b=>A(b,0,'OggS')&&(has(b.slice(0,64),'OpusHead')?D('opus','Opus','a','opus','audio/ogg',{}):has(b.slice(0,64),'theora')?D('ogv','Ogg Vídeo','v','ogv','video/ogg',{vis:'1.40'}):D('ogg','Ogg Vorbis','a','ogg','audio/ogg',{compat:['oga']})),
 b=>A(b,0,'MThd')&&D('midi','MIDI','a','midi','audio/midi',{compat:['mid']}),
 b=>A(b,0,'#!AMR')&&D('amr','AMR','a','amr','audio/amr'),
 b=>A(b,0,'FORM')&&(A(b,8,'AIFF')||A(b,8,'AIFC'))&&D('aiff','AIFF','a','aiff','audio/aiff',{compat:['aif']}),
 b=>b[0]===0x30&&b[1]===0x26&&b[2]===0xB2&&b[3]===0x75&&D('wmv','Windows Media (WMA/WMV)','v','wmv','video/x-ms-wmv',{compat:['wma'],vis:'1.40'}),
 b=>b[0]===0xFF&&(b[1]&0xF6)===0xF0&&D('aac','AAC','a','aac','audio/aac',{}),
 b=>((A(b,0,'ID3')&&b[3]<5)||(b[0]===0xFF&&(b[1]&0xE0)===0xE0&&((b[1]>>1)&3)!==0&&(b[2]>>4)!==0xF))&&D('mp3','MP3','a','mp3','audio/mpeg',{}),
 b=>b[0]===0x1A&&b[1]===0x45&&b[2]===0xDF&&b[3]===0xA3&&(has(b.slice(0,64),'webm')?D('webm','WebM','v','webm','video/webm',{vis:'1.40'}):D('mkv','Matroska (MKV)','v','mkv','video/x-matroska',{vis:'1.40'})),
 b=>A(b,0,'FLV\x01')&&D('flv','FLV','v','flv','video/x-flv',{vis:'1.40'}),
 b=>b[0]===0&&b[1]===0&&b[2]===1&&(b[3]===0xBA||b[3]===0xB3)&&D('mpeg','MPEG (MPG / VOB)','v','mpeg','video/mpeg',{vis:'1.40',compat:['mpg','vob']}),
 b=>b.length>=377&&((b[0]===0x47&&b[188]===0x47&&b[376]===0x47)||(b[4]===0x47&&b[192]===0x47&&b[380]===0x47))&&D('m2ts','MPEG Transport Stream','v','m2ts','video/mp2t',{vis:'1.40'}),
 b=>A(b,0,'PK')&&b[2]===3&&b[3]===4&&zip(b),
 b=>A(b,0,'PK')&&b[2]===5&&b[3]===6&&D('zip','ZIP (vazio)','z','zip','application/zip',{compat:ZIPFAM}),
 b=>A(b,0,'Rar!\x1A\x07')&&D('rar','RAR','z','rar'),
 b=>b[0]===0x37&&b[1]===0x7A&&b[2]===0xBC&&b[3]===0xAF&&b[4]===0x27&&b[5]===0x1C&&D('7z','7-Zip','z','7z'),
 b=>b[0]===0x1F&&b[1]===0x8B&&D('gz','GZip','z','gz','application/gzip',{compat:['tgz']}),
 b=>A(b,0,'BZh')&&b[3]>=0x31&&b[3]<=0x39&&D('bz2','BZip2','z','bz2'),
 b=>A(b,257,'ustar')&&D('tar','TAR','z','tar'),
 b=>A(b,0,'SQLite format 3\0')&&D('sqlite','SQLite','b','sqlite',null,{compat:['db','db3']}),
 b=>A(b,0,'PAR1')&&naoTexto(b,4,64)&&D('parquet','Parquet','b','parquet'),
 b=>(A(b,4,'Standard ACE DB')||A(b,4,'Standard Jet DB'))&&D('accdb','Microsoft Access','b','accdb',null,{compat:['mdb']}),
 b=>(A(b,0,'\0\x01\0\0')||A(b,0,'true'))&&b.length>12&&b[4]===0&&b[5]>0&&b[5]<64&&D('ttf','TrueType','f','ttf','font/ttf'),
 b=>A(b,0,'OTTO')&&b[4]===0&&b[5]>0&&b[5]<64&&D('otf','OpenType','f','otf','font/otf'),
 b=>A(b,0,'wOFF')&&((b[4]===0&&b[5]===1)||A(b,4,'OTTO')||A(b,4,'true'))&&D('woff','WOFF','f','woff','font/woff'),
 b=>A(b,0,'wOF2')&&((b[4]===0&&b[5]===1)||A(b,4,'OTTO')||A(b,4,'true'))&&D('woff2','WOFF2','f','woff2','font/woff2'),
 b=>b[34]===0x4C&&b[35]===0x50&&b.length>40&&U32(b,0)>0&&D('eot','EOT','f','eot'),
 b=>A(b,0,'MZ')&&pe(b),
 b=>b[0]===0xD0&&b[1]===0xCF&&b[2]===0x11&&b[3]===0xE0&&b[4]===0xA1&&b[5]===0xB1&&b[6]===0x1A&&b[7]===0xE1&&D('ole','Arquivo OLE (DOC / XLS / PPT / MSI)','t','doc',null,{compat:['doc','xls','ppt','msi'],vis:null}),
 b=>b[0]===0x7F&&A(b,1,'ELF')&&D('elf','Executável Linux (ELF)','x','bin',null,{compat:['so','appimage','bin','out']}),
 b=>(U32(b,0)===0xCAFEBABE)&&(U32(b,4)>=45?D('class','Java (.class)','x','java',null,{compat:['class'],icone:'java'}):D('macho','Executável macOS (Mach-O)','x','bin',null,{compat:['dylib']})),
 b=>[0xFEEDFACE,0xFEEDFACF,0xCEFAEDFE,0xCFFAEDFE].includes(U32(b,0))&&D('macho','Executável macOS (Mach-O)','x','bin',null,{compat:['dylib']}),
 b=>A(b,0,'!<arch>\ndebian-binary')&&D('deb','Pacote Debian','x','deb'),
 b=>b[0]===0xED&&b[1]===0xAB&&b[2]===0xEE&&b[3]===0xDB&&D('rpm','Pacote RPM','x','rpm'),
 b=>A(b,0,'xar!')&&D('pkg','Pacote macOS','x','pkg'),
 b=>b[0]===0&&A(b,1,'asm')&&b[4]===1&&D('wasm','WebAssembly','c','wasm'),
 b=>A(b,0,'glTF')&&b[4]===2&&D('glb','glTF binário (GLB)','d','glb','model/gltf-binary',{vis:'1.50',icone:'gltf'}),
 b=>A(b,0,'Kaydara FBX Binary')&&D('fbx','FBX binário','d','fbx',null,{vis:'1.50'}),
 b=>/^BLENDER[-_]v\d/.test(asc(b,0,10))&&D('blend','Blender','d','blend'),
 b=>/^AC1[0-9]{3}/.test(asc(b,0,6))&&b[6]===0&&D('dwg','AutoCAD (DWG)','d','dwg')
];
const RE_SHEBANG=[[/python/,'py'],[/node|deno|bun/,'js'],[/\b(ba|z|da|k)?sh\b|bash/,'sh'],[/perl/,'pl'],[/ruby/,'rb'],[/php/,'php'],[/lua/,'lua'],[/rscript/,'r'],[/pwsh|powershell/,'ps1']];
const T=(id,nome,ext,extra)=>D(id,nome,'c',ext,'text/plain',{texto:true,...extra});
const LING={py:'Python',js:'JavaScript',sh:'Shell Script',pl:'Perl',rb:'Ruby',php:'PHP',lua:'Lua',r:'R',ps1:'PowerShell'};
function detectarTexto(texto){
 const h=texto.slice(0,4096).replace(/^\uFEFF/,''),lin1=h.split('\n',1)[0].trim();
 if(lin1.startsWith('#!')){const l=lin1.toLowerCase();for(const [re,e] of RE_SHEBANG)if(re.test(l))return T(e,LING[e],e)}
 if(/^\s*<\?php/i.test(h))return T('php','PHP','php');
 if(/^\s*<\?xml/i.test(h))return /<svg[\s>]/i.test(h)?T('svg','SVG','svg'):T('xml','XML','xml');
 if(/^\s*<svg[\s>]/i.test(h))return T('svg','SVG','svg');
 if(/^\s*(<!doctype html|<html[\s>])/i.test(h))return T('html','HTML','html');
 if(/^ply\r?\n/.test(h))return T('ply','PLY (texto)','ply',{cat:'d',vis:'1.50'});
 if(/^solid\s/.test(h)&&/facet\s+normal/.test(h))return T('stl','STL (texto)','stl',{cat:'d',vis:'1.50'});
 if(/^\s*0\s*\r?\n\s*SECTION\s*\r?\n/.test(h))return T('dxf','DXF','dxf',{cat:'d'});
 if(/\\documentclass/.test(h))return T('tex','LaTeX','tex');
 if(/^-- MySQL dump/m.test(h)||/\/\*!40\d{3}/.test(h))return T('mysql','MySQL (exportação)','sql',{cat:'b',icone:'mysql',semConflito:['sql']});
 if(/^\s*(create\s+table|insert\s+into|alter\s+table|drop\s+table)\b/i.test(h))return T('sql','SQL','sql');
 if(/^---\s*\n[\w-]+:\s/.test(h))return T('yaml','YAML','yaml');
 if((h.match(/^v\s+-?\d/mg)||[]).length>=3&&/^f\s+\d/m.test(h))return T('obj','Wavefront OBJ','obj',{cat:'d',vis:'1.50'});
 if(/^\s*[\[{]/.test(h)&&texto.length<=2e6){let o;try{o=JSON.parse(texto)}catch(e){o=undefined}
  if(o!==undefined){if(o&&typeof o==='object'&&Array.isArray(o.layers)&&('fr' in o||'ip' in o)&&('w' in o||'h' in o))return T('lottie','Lottie (animação)','lottie',{cat:'v',semConflito:['json']});return T('json','JSON','json')}}
 return null}
const decodificarCabecalho=b=>{for(let i=0;i<b.length;i++)if(b[i]===0)return null;try{return new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(b))}catch(e){return null}};
// Entrada: { nome, head: bytes do início do arquivo, texto: conteúdo completo se for texto }
function identificar({nome,head,texto}){
 const extArq=extOf(nome||''),b=head||[];let det=null;
 if(b.length){for(const f of BIN){let r=false;try{r=f(b)}catch(e){}if(r){det=r;break}}}
 if(!det){const t=texto!=null?texto:(b.length?decodificarCabecalho(b):null);
  if(t!=null&&(!IDX.map[extArq]||['txt','json','sql'].includes(extArq))){det=detectarTexto(t)}}
 if(!det)return{formato:null,ext:extArq,icone:iconeDeExt(extArq),nome:null,via:IDX.map[extArq]?'extensao':'desconhecido',conflito:false,extArquivo:extArq,vis:null};
 const compat=!extArq||extArq===det.ext||iconeDeExt(extArq)===iconeDeExt(det.ext)||det.compat.includes(extArq)||det.semConflito.includes(extArq)||(det.texto&&extArq==='txt');
 const usaExtDoArquivo=det.compat.includes(extArq)&&iconeDeExt(extArq);
 return{formato:det,ext:usaExtDoArquivo?extArq:det.ext,icone:usaExtDoArquivo?iconeDeExt(extArq):det.icone,nome:det.nome,via:'conteudo',conflito:!compat,extArquivo:extArq,vis:det.vis}}
const api={identificar,detectarTexto,BIN};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.UDSDeteccao=api;
})(typeof window!=='undefined'?window:globalThis);
