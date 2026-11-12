# Página inicial e modos de trabalho

## Página inicial
Aparece depois da tela de loading (e quando você escolhe **Menu do logo → Arquivo → Página inicial**). Tem duas partes:
- **Projetos recentes** (à esquerda): as últimas pastas que você abriu, com o modo em que cada uma foi usada e há quanto tempo. Clique, ou use `↑` `↓` e `Enter`, para abrir. Cada projeto volta **no modo em que você o usou**. O alfinete **fixa** o projeto no topo da lista (um fixado nunca sai da lista; os demais ficam limitados a 12). Botão direito, ou `Delete`, **remove da lista**; `P` fixa e desafixa. Se a pasta foi apagada ou o pendrive saiu, a linha fica esmaecida e riscada e o programa avisa em vez de abrir.
- **Escolha a função** (à direita): quatro cartões, um por modo, com o atalho. **Áudio** e **Vídeo** aparecem como *em breve* (versões 1.4.4 e 1.4.5) e não podem ser escolhidos ainda. Mais os botões **Abrir pasta…** e **Abrir arquivo…**.

No rodapé, a caixa **Mostrar esta página ao iniciar**. A página some sozinha assim que você abre um projeto, um arquivo ou escolhe um modo; `Esc` também fecha.

**Configurações → Início e modos:**
- *Mostrar a página inicial ao iniciar* (ligado por padrão).
- *Reabrir direto o último projeto, no modo em que foi usado* (desligado por padrão). Quando ligado, o loading mostra *Abrindo o último projeto…* e o UDS pula a página inicial. Se a pasta não existir mais, cai na página inicial.

### De onde vêm os recentes
Ficam em `portable/config/settings.json`, no campo `recentes`: uma lista de objetos com `caminho`, `modo`, `fixado` e `ultimoUso`. **Migração automática:** a lista antiga (só os caminhos, em texto) é convertida na primeira abertura da 1.4.2, tudo no modo Universal, e o campo antigo `recent` é apagado. Caminhos iguais com barras diferentes (`C:\a` e `c:/a/`) contam como o mesmo projeto.

## Modos de trabalho
Um modo é uma **tela do UDS pensada para um tipo de trabalho**: ele decide quais áreas ficam visíveis (barra lateral, painel inferior, notas) e pode ter regras próprias. **Trocar de modo só mexe no layout**: a pasta aberta, as abas e as alterações não salvas continuam como estão.

| Modo | Atalho | O que faz |
|---|---|---|
| **Universal** | `Ctrl+1` | O UDS de sempre, sem nenhuma mudança |
| **Texto** | `Ctrl+2` | Só o editor. Explorador, painel e notas começam recolhidos (você abre quando quiser). Barra com **linhas · palavras · caracteres** do arquivo aberto (atualiza ao digitar) e botões de tamanho da fonte. Arquivos que não são texto (imagem, áudio, vídeo, PDF…) pedem para **trocar de modo** ou **abrir como texto**, em vez de abrir fora de lugar |
| Áudio | `Ctrl+3` | Em breve (1.4.4, com o editor de áudio). Hoje o atalho avisa e não muda nada |
| Vídeo | `Ctrl+4` | Em breve (1.4.5, com o editor de vídeo) |

- O **seletor de modo** fica na barra superior, ao lado do logo. O menu do logo também lista os modos.
- **Cada modo lembra os painéis que você deixou visíveis nele.** Se no Texto você abrir o explorador, da próxima vez que entrar no Texto ele estará aberto.
- Na **primeira abertura depois da atualização**, o layout que você já usava vira o do Universal, sem nenhuma mudança.
- Abrir uma pasta no modo Texto **não** força a barra lateral a abrir (nos outros modos, sim).
- Os avisos curtos da barra de status (como *Salvo.* e *O modo Áudio chega na versão 1.4.4*) agora duram os 2,5 s combinados: antes o indicador de linha e coluna os apagava na hora, em quem estava digitando.

## Como criar um modo novo
1. Crie `src/modos/<nome>.js` e chame `UDSModos.registrar({ id, nome, icone, desc, atalho, layoutPadrao, abreExplorador, ... })` (veja `texto.js` como exemplo).
2. Acrescente o `<script src="modos/<nome>.js">` no `src/index.html`, depois de `modos/registro.js`.
3. Escreva um teste em `tests/modos.test.js`. O teste "ligação no index.html" já confere que todo arquivo de `src/modos/` está carregado.

`icone` é um trecho de SVG 24×24 (traços, sem cor fixa). `disponivel:false` mostra o modo como "em breve"; `previsto` diz em que versão chega.

## Limites
- O Texto ainda não tem quebra de linha automática nem os botões de Markdown (chegam com a etapa 1.70).
- A checagem de pasta que sumiu usa a listagem de arquivos; em uma pasta enorme em disco de rede pode demorar um instante (acontece em segundo plano e não trava a tela).
- Áudio e Vídeo ainda não existem como modos (só os cartões "em breve").

## Testes
- `npm test`: `tests/recentes.test.js` (migração, duplicados, fixados, limite, ordem, tempo relativo), `tests/modos.test.js` (registro, troca de layout, nada além do layout é tocado, migração, contagem, ligação no `index.html` e no `app.js`).
- `node tests/inicio.navegador.js` (opcional, Playwright + Chromium): roda o **app real** com o núcleo Tauri simulado, lendo arquivos de verdade. Cobre migração, os quatro cartões, `↓` e `Enter`, o modo guardado, fixar, remover, pasta sumida, troca de modo **sem perder abas nem alterações** (digitando e conferindo), contagem ao digitar, Áudio e Vídeo avisando, o Texto pedindo para trocar ao abrir uma imagem, as configurações e *reabrir o último projeto*. **Não substitui** o teste no WebView2 do Windows.
