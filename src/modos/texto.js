// Modo Texto: o editor de texto em primeiro plano. Explorador, painel e notas começam recolhidos (você pode abri-los quando quiser).
// Arquivos que não são texto (imagem, áudio, vídeo...) pedem para trocar de modo, em vez de abrir fora de lugar.
// Contagem do modo Texto (função pura, testada): linhas, palavras e caracteres.
const contarTexto=t=>{t=String(t==null?'':t);return{linhas:t===''?0:t.split('\n').length,palavras:(t.match(/\S+/g)||[]).length,caracteres:t.length}};
if(typeof module!=='undefined'&&module.exports)module.exports={contarTexto};
if(typeof UDSModos!=='undefined'){
 UDSModos.texto={contarTexto};
 UDSModos.registrar({id:'texto',nome:'Texto',atalho:'2',desc:'Só o editor de texto, com contagem de linhas, palavras e caracteres.',
  icone:'<path d="M5 4h14M5 9h14M5 14h9M5 19h6"/>',
  layoutPadrao:{sideOpen:false,panelOpen:false,notesOpen:false},abreExplorador:false,
  // true se o arquivo cabe neste modo (abre no editor, não em um visualizador)
  aceita:(caminho,doc,temVisualizador)=>!temVisualizador});
}
