// Registro de visualizadores (versão 0.80).
// Cada visualizador é um módulo que se registra com UDS.registerViewer({ id, nome, match, open }).
//   match(caminho, doc) -> true se este módulo sabe abrir o arquivo
//   open(caminho, doc, container, ctx) -> desenha o conteúdo dentro de `container`
// O núcleo não conhece nenhum visualizador específico: para suportar um formato novo, crie um arquivo
// nesta pasta, chame registerViewer e inclua o <script> no index.html.
window.UDS=window.UDS||{viewers:[]};
UDS.registerViewer=v=>{UDS.viewers=UDS.viewers.filter(x=>x.id!==v.id);UDS.viewers.push(v)};
UDS.findViewer=(p,d)=>UDS.viewers.find(v=>{try{return v.match(p,d)}catch(e){return false}});
