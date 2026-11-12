// Projetos recentes (1.4.2): módulo puro, sem tela. Cada projeto guarda o caminho, o modo em que foi usado,
// se está fixado e quando foi usado pela última vez. Entradas antigas (só o caminho, em texto) são migradas sozinhas.
(function(root){
const LIMITE=12;
const MODO_PADRAO='universal';
const ehTexto=x=>typeof x==='string'&&x.trim()!=='';
// Chave de comparação: separadores iguais, sem barra no fim; no Windows (C:\ ou \\servidor) maiúsculas e minúsculas são iguais.
function chave(caminho){let c=String(caminho).trim().replace(/\\/g,'/');if(c.length>1&&!/^[a-z]:\/$/i.test(c))c=c.replace(/\/+$/,'');return /^([a-z]:|\/\/)/i.test(c)?c.toLowerCase():c}
function nomeDe(caminho){const p=String(caminho).replace(/[\\/]+$/,'').split(/[\\/]/);return p[p.length-1]||String(caminho)}
function limpa(x){if(ehTexto(x))return{caminho:x.trim(),modo:MODO_PADRAO,fixado:false,ultimoUso:0};
 if(!x||typeof x!=='object'||!ehTexto(x.caminho))return null;
 return{caminho:x.caminho.trim(),modo:ehTexto(x.modo)?x.modo:MODO_PADRAO,fixado:x.fixado===true,ultimoUso:Number.isFinite(+x.ultimoUso)&&+x.ultimoUso>0?+x.ultimoUso:0}}
// Fixados primeiro, depois do mais recente para o mais antigo. Empate: mantém a ordem de entrada.
function ordenar(lista){return lista.map((x,i)=>[x,i]).sort((a,b)=>(b[0].fixado-a[0].fixado)||(b[0].ultimoUso-a[0].ultimoUso)||(a[1]-b[1])).map(x=>x[0])}
function aparar(lista,limite){let livres=0;return lista.filter(x=>x.fixado||++livres<=limite)}
// Aceita qualquer coisa vinda do settings.json (lista de textos antiga, lista nova, lixo) e devolve uma lista limpa.
function normalizar(entrada,limite=LIMITE){if(!Array.isArray(entrada))return[];const vistos=new Map();
 for(const bruto of entrada){const x=limpa(bruto);if(!x)continue;const k=chave(x.caminho),y=vistos.get(k);
  // duplicado: vale o mais recente (no empate, o que veio primeiro); fixado se qualquer um estava fixado
  if(!y)vistos.set(k,x);else vistos.set(k,{...(x.ultimoUso>y.ultimoUso?x:y),fixado:x.fixado||y.fixado})}
 return aparar(ordenar([...vistos.values()]),limite)}
function adicionar(lista,caminho,modo,agora,limite=LIMITE){if(!ehTexto(caminho))return normalizar(lista,limite);const k=chave(caminho),ant=normalizar(lista,Infinity).find(x=>chave(x.caminho)===k);
 const novo={caminho:caminho.trim(),modo:ehTexto(modo)?modo:(ant?ant.modo:MODO_PADRAO),fixado:ant?ant.fixado:false,ultimoUso:+agora||Date.now()};
 return aparar(ordenar([novo,...normalizar(lista,Infinity).filter(x=>chave(x.caminho)!==k)]),limite)}
const remover=(lista,caminho)=>normalizar(lista,Infinity).filter(x=>chave(x.caminho)!==chave(caminho));
const alternarFixado=(lista,caminho)=>ordenar(normalizar(lista,Infinity).map(x=>chave(x.caminho)===chave(caminho)?{...x,fixado:!x.fixado}:x));
const definirModo=(lista,caminho,modo)=>normalizar(lista,Infinity).map(x=>chave(x.caminho)===chave(caminho)&&ehTexto(modo)?{...x,modo}:x);
function tempoRelativo(agora,ts){if(!ts||ts<=0)return'';const s=Math.floor((agora-ts)/1000);if(s<45)return'agora há pouco';const m=Math.floor(s/60);if(m<60)return`há ${Math.max(1,m)} min`;
 const h=Math.floor(m/60);if(h<24)return`há ${h} h`;const d=Math.floor(h/24);if(d===1)return'ontem';if(d<7)return`há ${d} dias`;if(d<30){const w=Math.floor(d/7);return w===1?'há 1 semana':`há ${w} semanas`}
 if(d<365){const mm=Math.floor(d/30);return mm===1?'há 1 mês':`há ${mm} meses`}const a=Math.floor(d/365);return a===1?'há 1 ano':`há ${a} anos`}
const api={LIMITE,MODO_PADRAO,chave,nomeDe,normalizar,adicionar,remover,alternarFixado,definirModo,ordenar,tempoRelativo};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.UDSRecentes=api;
})(typeof window!=='undefined'?window:globalThis);
