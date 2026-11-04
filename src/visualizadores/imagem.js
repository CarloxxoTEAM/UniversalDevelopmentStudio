// Visualizador de imagens (versão 0.70): zoom, rotação, ajuste, fundo xadrez para transparência e informações.
UDS.registerViewer({
 id:'imagem',nome:'Imagem',
 match:(p,d)=>d.kind=='image'||['png','jpg','jpeg','gif','webp','bmp','ico','svg'].includes(UDSCore.extOf(p)),
 open(p,d,box,ctx){let z=1,r=0,dim='';
  box.innerHTML='<div class="tb"><button data-a="+">Zoom +</button><button data-a="-">Zoom −</button><button data-a="r">Girar 90°</button><button data-a="f">Ajustar</button><span id="ii"></span></div><div class="chk"><img alt=""></div>';
  const im=box.querySelector('img'),info=box.querySelector('#ii');
  im.onerror=()=>ctx.fail('Não foi possível decodificar esta imagem.');im.src=ctx.url(p);
  const ap=()=>{im.style.transform=`scale(${z}) rotate(${r}deg)`;info.textContent=`${dim}${Math.round(z*100)}% · ${r}° · ${(d.size/1024).toFixed(1)} KB · ${d.mime||''}`};
  im.onload=()=>{dim=`${im.naturalWidth}×${im.naturalHeight} · `;ap()};
  box.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{const a=b.dataset.a;if(a=='+')z*=1.25;if(a=='-')z/=1.25;if(a=='r')r=(r+90)%360;if(a=='f'){z=1;r=0}ap()});ap()}
});
