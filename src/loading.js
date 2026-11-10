// Tela de loading do UDS (1.05): painel de abertura no estilo da abertura de programas de criação.
// Aparece assim que a página carrega, mostra o que está sendo carregado (etapas reais do app.js) e some sozinha.
// Regras: fica visível pelo menos MINIMO ms (para a animação ser lida), nunca passa de LIMITE ms (se algo travar),
// e pode ser pulada com clique, Esc, Enter ou Espaço. Respeita "reduzir movimento" do sistema.
(function(root){
const MINIMO=1300,LIMITE=8000,FADE=380;
// Quanto falta esperar para cumprir o tempo mínimo (função pura, testada).
const esperaRestante=(agora,minimo=MINIMO)=>Math.max(0,minimo-agora);
// A barra só avança, nunca volta (função pura, testada).
const proximaFracao=(atual,nova)=>Math.max(atual,Math.min(1,Math.max(0,+nova||0)));
const api={MINIMO,LIMITE,FADE,esperaRestante,proximaFracao};
if(typeof document==='undefined'){if(typeof module!=='undefined'&&module.exports)module.exports=api;return}
const el=document.getElementById('uds-splash');
let fracao=0,fechando=false,fechado=false,pedidoFim=false;
const agora=()=>performance.now();
const $=s=>el&&el.querySelector(s);
function texto(t){const e=$('#sp-st');if(e)e.textContent=t}
function barra(){const b=$('#sp-bar');if(b)b.style.transform=`scaleX(${fracao})`}
function remover(){if(fechado)return;fechado=true;if(el){el.style.display='none';el.setAttribute('aria-hidden','true')}document.removeEventListener('keydown',tecla,true)}
function sair(rapido){if(fechando||!el)return;fechando=true;fracao=1;barra();el.classList.add('sp-sai');if(rapido)el.classList.add('sp-rapido');
 setTimeout(remover,rapido?120:FADE)}
function tentarSair(){if(!pedidoFim||fechando)return;const e=esperaRestante(agora());e>0?setTimeout(()=>sair(false),e):sair(false)}
function tecla(e){if(e.ctrlKey||e.metaKey||e.altKey)return;if(e.key==='Escape'||e.key==='Enter'||e.key===' '){e.preventDefault();sair(true)}}
api.etapa=(t,f)=>{if(fechando)return;if(t)texto(t);fracao=proximaFracao(fracao,f);barra()};
api.versao=v=>{const e=$('#sp-ver');if(e)e.textContent='Versão '+v};
// Chamada quando o app terminou de carregar. A tela espera o tempo mínimo e some.
api.concluir=()=>{pedidoFim=true;fracao=1;barra();tentarSair()};
// Preferência do usuário (Configurações → Aparência). Desligada: some na hora.
api.preferencia=ligada=>{try{localStorage.setItem('uds.loading',ligada?'1':'0')}catch(e){}if(!ligada)sair(true)};
api.ativa=()=>!!el&&!fechado;
if(el){let desligada=false;try{desligada=localStorage.getItem('uds.loading')==='0'}catch(e){}
 if(desligada){remover()}else{
  el.addEventListener('pointerdown',()=>sair(true));document.addEventListener('keydown',tecla,true);
  setTimeout(()=>sair(false),LIMITE);texto('Iniciando…');barra()}}
root.UDSLoading=api;
})(typeof window!=='undefined'?window:globalThis);
