// Registro de modos de trabalho (1.4.2), igual ao registro de visualizadores.
// Um modo é uma tela do UDS pensada para um tipo de trabalho: define quais áreas ficam visíveis (barra lateral, painel inferior, notas)
// e pode ter regras próprias. Para criar um modo novo: um arquivo em src/modos/ que chama UDSModos.registrar({...}) e o <script> no index.html.
//   { id, nome, icone (trecho de SVG 24×24), desc, atalho ('1'..'9', usado com Ctrl), layoutPadrao, abreExplorador, disponivel, previsto, aceita(caminho, doc) }
// Trocar de modo só mexe no layout: pasta aberta, abas e alterações não salvas continuam como estão.
(function(root){
const modos=[];const CHAVES=['sideOpen','panelOpen','notesOpen'];const LAYOUT_BASE={sideOpen:true,panelOpen:true,notesOpen:true};
function registrar(m){if(!m||!m.id)throw new Error('modo sem id');const i=modos.findIndex(x=>x.id===m.id);const novo={disponivel:true,abreExplorador:true,...m};if(i>=0)modos[i]=novo;else modos.push(novo);return novo}
const lista=()=>modos.slice(),obter=id=>modos.find(m=>m.id===id)||null,doAtalho=n=>modos.find(m=>m.atalho===String(n))||null;
const layoutAtual=cfg=>{const o={};CHAVES.forEach(k=>o[k]=cfg[k]!==false);return o};
// Troca o modo em `cfg` (objeto de configurações). Guarda o layout do modo que sai e aplica o do modo que entra.
// Devolve { ok, de, para } ou { ok:false, motivo }. Não mexe em abas, documentos nem pasta aberta.
function trocar(cfg,para){const de=cfg.modo||'universal',m=obter(para);if(!m)return{ok:false,motivo:'desconhecido'};if(m.disponivel===false)return{ok:false,motivo:'indisponivel',previsto:m.previsto||''};
 cfg.layouts=cfg.layouts&&typeof cfg.layouts==='object'?cfg.layouts:{};cfg.layouts[de]=layoutAtual(cfg);
 const alvo=cfg.layouts[para]||m.layoutPadrao||LAYOUT_BASE;CHAVES.forEach(k=>{cfg[k]=alvo[k]!==false});cfg.modo=para;return{ok:true,de,para}}
// Primeira abertura depois da atualização: o layout que a pessoa já usava vira o do Universal, sem nenhuma mudança.
function iniciar(cfg){if(!obter(cfg.modo))cfg.modo='universal';if(!cfg.layouts||typeof cfg.layouts!=='object')cfg.layouts={};if(!cfg.layouts.universal&&cfg.modo==='universal')cfg.layouts.universal=layoutAtual(cfg);return cfg}
const api={CHAVES,LAYOUT_BASE,registrar,lista,obter,doAtalho,layoutAtual,trocar,iniciar};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.UDSModos=api;
})(typeof window!=='undefined'?window:globalThis);
