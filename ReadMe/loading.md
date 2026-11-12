# Tela de loading

Ao abrir o UDS aparece um painel escuro, no centro da janela, com o logo se montando (o cubo é desenhado traço a traço), o nome do programa em degradê, a frase *One Studio. Unlimited Possibilities.*, uma linha dizendo **o que está sendo carregado** e uma barra de progresso. Quando o programa termina de carregar, o painel some com um fade e a tela inicial aparece.

## O que ela mostra
As mensagens são etapas **reais** do carregamento (não são enfeite): *Carregando as configurações…* → *Lendo os temas…* → *Montando a interface…*. A barra só avança, nunca volta. No canto inferior, a versão do programa e a licença.

## Quanto tempo dura
- **Pelo menos 1,3 s**, para a animação poder ser vista, mesmo que o programa carregue mais rápido.
- **No máximo 8 s.** Se alguma coisa travar, a tela libera o programa sozinha (e o erro aparece no console, sem prender você).
- Se o carregamento falhar por qualquer motivo, a tela também some.

## Como pular ou desligar
- **Pular:** clique em qualquer lugar da tela, ou `Esc`, `Enter` ou `Espaço`. Atalhos com `Ctrl` (como `Ctrl+O`) não pulam.
- **Desligar:** *Configurações → Aparência → Tela de loading → Mostrar ao iniciar*. A escolha fica em `portable/config/settings.json` (campo `mostrarLoading`) e também em uma dica interna do navegador do programa, para a tela não piscar no começo quando estiver desligada. Em um computador novo, ela pode aparecer por uma fração de segundo uma única vez antes de entender que está desligada.

## Cores e movimento
- O painel usa a **identidade fixa da marca** (fundo escuro e degradê laranja → rosa), igual em qualquer tema, como as telas de abertura de programas de criação. Ele aparece antes do tema ser carregado.
- Se o sistema estiver com **"reduzir movimento"** ligado, não há animação: o cubo já aparece completo e a troca é instantânea.
- O painel é anunciado para leitores de tela (`aria-live`).

## Limites desta versão
- É um **painel dentro da janela principal**, não uma janelinha separada sem bordas. Uma janela separada precisa de mudanças no núcleo em Rust e nas permissões, e se falhasse a janela principal poderia abrir invisível; por isso ficou para depois de confirmar o build no Windows.
- A mensagem *Abrindo o último projeto…* aparece só quando você liga *Reabrir direto o último projeto* em *Configurações → Início e modos* (desde a 1.4.2; veja `inicio-e-modos.md`).

## Como funciona por dentro
1. `src/index.html` traz o painel (`#uds-splash`) **antes** do aplicativo, então ele já está na tela quando o resto carrega. Os estilos ficam no fim de `src/styles.css`.
2. `src/loading.js` expõe `UDSLoading`: `etapa(texto, fração)`, `versao(v)`, `concluir()`, `preferencia(ligada)` e `ativa()`.
3. `src/app.js` chama `etapa()` em cada passo da inicialização e `concluir()` num `finally`, então o painel nunca fica preso.
4. As regras de tempo (`esperaRestante`) e da barra (`proximaFracao`) são funções puras, testadas sem tela.

## Testes
- `npm test` roda `tests/loading.test.js`: tempo mínimo, barra que só avança, limites, o painel no `index.html` antes do app, `loading.js` antes de `app.js`, `concluir()` sempre chamado, estilos de "reduzir movimento".
- `node tests/loading.navegador.js` (opcional, precisa do Playwright com Chromium) roda o **app de verdade** (`index.html` e `app.js`) com o núcleo Tauri simulado: confere as etapas na tela, que não some antes de 1,3 s, que o app aparece pronto, pular por clique, `Esc`, `Enter` e `Espaço`, que `Ctrl` não pula, desligar (e a opção em Configurações salvando), falha na configuração, o limite de 8 s e "reduzir movimento". **Não substitui** o teste no WebView2 do Windows.
