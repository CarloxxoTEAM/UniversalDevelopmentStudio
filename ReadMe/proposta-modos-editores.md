# Proposta: Página inicial, Modos de trabalho, Visualizar, Markdown e editores de áudio e vídeo

**Situação:** a **1.4.2 já entregou** a página inicial (✚ 4.05), os modos Universal e Texto (✚ 4.02) e o Visualizar (✚ 1.45), usando os padrões sugeridos na seção 5. **Faltam** o Markdown em 2 modos (1.70, parte Markdown, versão 1.4.3), o editor de áudio (✚ 2.70, 1.4.4) e o editor de vídeo (✚ 2.80, 1.4.5), com os modos Áudio e Vídeo. As decisões da seção 5 que ainda valem para essas etapas continuam abertas (FFmpeg, formato de saída do áudio, biblioteca de Markdown, modo padrão do `.md`).

Este arquivo tem duas partes: **Ajustes depois da 1.4.0** (o que mudou desde que a proposta foi escrita e as respostas do código) e o **texto original da proposta**, sem alterações. Onde os dois divergirem, vale a parte de ajustes.

---

## Ajustes depois da 1.4.0

### 0. Decisões da seção 5 usadas na 1.4.2
Como não houve resposta, a 1.4.2 usou os padrões sugeridos, todos fáceis de trocar: **ao abrir um recente, volta no último modo usado**; **nomes** Universal, Texto, Áudio e Vídeo, com `Ctrl+1` a `Ctrl+4`; **projetos recentes à esquerda e as funções à direita**; **Visualizar em janela flutuante** (encostada à direita), não em painel fixo.

### 1. O que já foi entregue
- A proposta foi escrita sem o código-fonte e supunha que o **Visualizador de vídeo (1.40)** estaria dentro da versão 1.4.0 junto com a página inicial. Ele **já foi publicado na 1.4.0, sozinho** (veja `video.md` e `atualizacoes.md`). Então a lista da seção "1.4.0" do texto original passa a ter só: Página inicial, Modos de trabalho e Visualizar.
- O que o vídeo já tem, comparado com o texto original: toca MP4, M4V, MOV, 3GP, MKV e WebM (conforme os codecs do sistema); OGV avisa "sem imagem"; AVI, WMV, FLV, MPEG, VOB e M2TS mostram só as informações. Além dos atalhos citados, existem `,` `.` (quadro a quadro), `L` (repetir) e `F` (tela cheia).
- O **editor de vídeo (2.80)** pode reaproveitar `src/videometa.js` (duração, fps, rotação, perfil e nível, leitura por trechos) e o passo por quadro, em vez de começar do zero.

### 2. Numeração
- A etapa **✚ 1.45 passa a ser "Visualizar"**, como na proposta. Os complementos de vídeo que eu tinha chamado de 1.45 (capturar quadro, legendas, duração de MP4 fragmentado) viraram **✚ 1.46**.
- Versões do programa sugeridas (as etapas do roteiro têm numeração própria; o número da versão só diz a ordem de entrega). **Dependem da sua confirmação:**

| Versão | Conteúdo | Etapas |
|---|---|---|
| **1.4.0** | Vídeo (**publicada**) | 1.40 |
| **1.4.1** | Tela de loading (**feita**) | 1.05 |
| **1.4.2** | Página inicial + Modos de trabalho (Universal e Texto) + Visualizar (**feita**, aguardando publicação) | ✚ 4.05, ✚ 4.02, ✚ 1.45 |
| **1.4.3** | Markdown em 2 modos + prévia ao vivo no Modo Texto | 1.70 (parte Markdown) |
| **1.4.4** | Editor de áudio + Modo Áudio | ✚ 2.70 |
| **1.4.5** | Editor de vídeo (FFmpeg) + Modo Vídeo | ✚ 2.80 |

- A **1.05 (loading)** foi feita antes da página inicial, como recomendado, então a sequência *loading → página inicial* já nasce completa.

### 3. Respostas da seção 6 ("Confirmar no código"), já conferidas
| Pergunta | O que o código mostra |
|---|---|
| Como o layout e os 3 botões funcionam? | `cfg.sideOpen`, `cfg.panelOpen` e `cfg.notesOpen` + `applyLayout()` mostram e escondem as áreas; os botões `#t1`, `#t2` e `#t3` só chamam `toggle(chave)`. **Um modo pode ser um conjunto dessas três chaves**, sem mexer no layout. |
| Onde ficam os recentes e em que formato? | Em `cfg.recent`, uma **lista de caminhos (texto)**, com limite de 12, atualizada em `setRoot()`. Aparece no menu *Projeto* (`#proj`) e na tela de boas-vindas (`welcome()`). **Falta** guardar o modo e fixar: o formato vira uma lista de objetos (`caminho`, `modo`, `fixado`, `ultimoUso`), com **migração automática** dos textos antigos na primeira leitura. |
| Como o menu de contexto é montado? | Em `$('#side').oncontextmenu` (`app.js`): uma lista `it` de `{t, f}` passada a `popup($('#ctx'), x, y, it)`. Hoje ele **só abre com a aba Explorador ativa e uma pasta aberta**, e só trata arquivos e pastas do explorador. *Visualizar* entra como um item novo no começo da lista. |
| Assinatura de `ctx`? | `{ url, cfg (leitura), saveCfg, onLimpar, fail }`. **Atenção:** `onLimpar` guarda **uma única** função (a da aba atual). A janela de prévia precisa de um `ctx` **próprio**, com a sua limpeza, para não derrubar o visualizador da aba. |
| Os visualizadores funcionam fora da aba? | Sim: `imagem.js`, `audio.js` e `video.js` só procuram elementos **dentro do contêiner recebido** (`box.querySelector`), nunca no documento. Podem abrir em uma janela flutuante, mesmo com outro visualizador aberto ao mesmo tempo. |
| Escopo do protocolo `asset` e permissões? | `assetProtocol` ligado com escopo `**` (qualquer pasta), `csp: null`, `protocol-asset` no Cargo e permissões `core:default` e `dialog:default`. **Cobre** vídeo, áudio e prévia sem mudança. Os comandos novos do núcleo (`path_exists`, `dir_summary`, `write_file_bytes`, `unique_path`, FFmpeg) precisam entrar em `generate_handler!`. |
| `write_file` aceita bytes? | **Não**: recebe `content: String`. Por isso a proposta tem razão em criar `write_file_bytes`. Como o Tauri é o 2, vale enviar os bytes como corpo bruto do `invoke`, e não como lista de números (um áudio de 200 MB em lista de números é lento e pesado). |
| O WebView2 toca H.264/AAC? | **Ainda não confirmado** (pendência da 1.4.0 e da 1.3.x). Isso define o que o editor de vídeo consegue pré-visualizar. WebM foi testado tocando de verdade, em Chromium. |
| Atalhos `Ctrl+1` a `Ctrl+4` conflitam? | **Não.** Hoje existem `Ctrl+S`, `Ctrl+O`, `Ctrl+,`, `Ctrl++`, `Ctrl+-` e `Ctrl+0` (zoom). |
| Existe comando para ver se uma pasta ainda existe? | Não existe `path_exists`. Enquanto não entra, `list_dir` com erro já indica pasta ausente. |

### 4. Pontos novos que a leitura do código trouxe
- **Mesmo vídeo em dois lugares:** a aba e a janela de prévia podem abrir o mesmo arquivo. O `video.js` guarda a posição em `d.estadoVideo` (por documento). A prévia deve usar um documento próprio (cópia leve) para não disputar a posição com a aba.
- **FFmpeg no pacote:** o ZIP portátil é montado pelo GitHub Actions. Colocar `tools/ffmpeg/` dentro dele exige que o Actions baixe uma versão **LGPL** conhecida e confira o hash, no Windows e no Linux. Isso só pode ser confirmado pelo robô (eu não compilo nem testo o .exe).
- **Teste do editor de vídeo:** dá para testar a montagem dos argumentos (Rust, `cargo test`) e a duração do resultado com o **ffprobe**, como já se faz hoje; o cancelamento e o progresso só se confirmam no Windows.
- **Markdown:** os `.md` do projeto usam `<!-- formatos:inicio -->` e tabelas grandes (README); o teste "todos os `.md` do projeto" da proposta é um bom critério de aceitação.

---

## Texto original da proposta

Proposta para os 4 recursos novos, adaptada à arquitetura descrita em `ReadMe/estrutura.md`. Está no formato de `ReadMe/atualizacoes.md`, para ser copiada para lá quando cada versão for entregue.

> **Base da análise:** só foram enviados os guias da pasta `ReadMe/` e o `README.md`; o código-fonte (`src/`, `src-tauri/`) não veio no ZIP. Tudo abaixo segue o que está documentado. Os pontos que dependem do código estão em **"Confirmar no código antes de implementar"**, no fim.

---

## 1. O que a arquitetura atual já oferece (e será reaproveitado)

| Recurso novo | O que já existe e será reaproveitado |
|---|---|
| Projetos recentes | `portable/config/settings.json` (já guarda tema, volume e zoom). A `ideias.md` diz que a tela inicial **já lista recentes de forma simples**: a lista será ampliada, não recriada. Comando `list_dir` e o explorador existente para abrir a pasta. |
| Modos de trabalho | Os 3 botões que já mostram ou escondem **Barra lateral, Painel inferior e Notas** (cada modo começa como um conjunto dessas áreas), o registro de visualizadores (modelo para o registro de modos), os temas e a caixa de Configurações. |
| Editor de áudio | Visualizador de áudio (`visualizadores/audio.js`), `decodeAudioData` (já usado na forma de onda), `audiometa.js`, protocolo `asset` do Tauri (leitura em trechos). |
| Editor de vídeo | Protocolo `asset` e o padrão de módulo de visualizador. **Falta o visualizador de vídeo (etapa 1.40)**, que passa a ser pré-requisito. |
| Visualizar | Registro de visualizadores (`UDS.registerViewer`, com `match` e `open(caminho, doc, container, ctx)`), detecção pelo conteúdo (`deteccao.js`), caixa flutuante arrastável das Configurações (modelo para a janela de prévia), ícones de arquivo e pasta. |
| Menus | Menu de contexto do explorador (hoje: novo arquivo, nova pasta, renomear, excluir) em `app.js`. Só ganha itens novos. |

### Pontos de atenção do roteiro
- **Loading (1.05) ainda não existe.** A página inicial aparece **depois do loading**. Enquanto a 1.05 não for feita, ela aparece assim que a janela principal estiver pronta. Recomendação: fazer a 1.05 logo antes da 1.4.0, para a sequência *loading → página inicial* já nascer completa.
- **Vídeo (1.40), PDF (1.70) e ZIP como pasta (1.90) ainda não existem.** O "Visualizar" os usa quando chegarem; até lá, mostra a tela de informações que já existe para formatos reconhecidos.
- **Cortar vídeo de verdade exige o FFmpeg** (veja a decisão na seção 5). O núcleo atual só lê e grava arquivos.

---

## 2. Versões sugeridas

Seguindo a divisão do roteiro (etapas novas marcadas com ✚):

| Versão | Conteúdo | Etapa do roteiro |
|---|---|---|
| **1.4.0** | **Página inicial** (projetos recentes + escolha do modo) + **Modos de trabalho** (Universal, que é o UDS de hoje, e Texto) + Visualizador de vídeo + Visualizar | ✚ 4.05 (antecipada), ✚ 4.02, 1.40, ✚ 1.45 |
| **1.4.1** | Markdown em 2 modos (código e formatado, como no GitHub) + prévia ao vivo no **Modo Texto** | 1.70 (parte Markdown, antecipada) |
| **1.5.0** | Editor de áudio + **Modo Áudio** | ✚ 2.70 |
| **1.6.0** | Editor de vídeo (com FFmpeg) + **Modo Vídeo** | ✚ 2.80 |
| **1.6.x** | Visualizar documentos (PDF e outros), conforme a 1.70 chegar | 1.70 |

---

## 3. Lista de atualização

## 1.4.0 — Página inicial, Modos de trabalho e Visualizar

**Novo**

*Página inicial (✚ 4.05)*
- Depois do loading, abre uma **página simples**, na identidade atual (logo, degradê laranja → rosa e o tema escolhido), com tudo em uma tela:
  1. **Projetos recentes** (o principal da página).
  2. **Escolha da função:** 4 cartões grandes, *Universal*, *Texto*, *Áudio* e *Vídeo*.
  3. Botões **Abrir pasta** e **Abrir arquivo**.
- É feita para ir rápido: **um clique** em um projeto e ele abre. Teclado: `↑` `↓` e `Enter`; `Ctrl+1` a `Ctrl+4` escolhem a função.
- Cada projeto recente mostra o nome da pasta, o caminho e "há quanto tempo", e um ícone do **modo em que foi usado**. Ao clicar, ele volta **nesse modo**, do jeito que você deixou.
- Pasta que não existe mais (apagada, pendrive removido) aparece esmaecida; o clique avisa na barra de status, e o botão direito tem *Remover da lista*.
- Fixar um projeto (📌) para ele não sair da lista, como previsto na `ideias.md`.
- Não atrapalha: some ao abrir qualquer coisa e volta por *Página inicial* no menu do logo. Em *Configurações → Início e modos*: mostrar a página ao iniciar (ligado por padrão), ou reabrir direto o último projeto.

*Modos de trabalho (✚ 4.02)*
- Um **modo** é uma tela do UDS pensada para um tipo de trabalho: o painel e os botões (HUD) mostram **só o que aquela função usa**.
- **Universal** é o UDS de hoje, **sem nenhuma mudança**: explorador, abas, editor, notas e painel inferior. Foco total em tudo.
- **Texto:** só o editor de texto em primeiro plano. Explorador recolhido, barra com contagem de linhas, palavras e caracteres, quebra de linha, fonte e, nos `.md`, os botões Código / Visualização / Dividido (1.4.1). Arquivo de outro tipo pede para trocar de modo, em vez de abrir fora de lugar.
- **Áudio** (1.5.0) e **Vídeo** (1.6.0): cada um com o seu HUD (veja as versões abaixo).
- Troca de modo **sem perder nada**: a pasta aberta, as abas e o que não foi salvo continuam. Cada modo lembra os painéis que você deixou visíveis.
- **Seletor de modo** na barra superior, ao lado do logo, e `Ctrl+1` a `Ctrl+4` (não conflitam com os atalhos atuais).
- **Registro de modos**, igual ao de visualizadores (`UDS.registerMode({ id, nome, icone, hud, match, atalhos })`): novos modos (3D, Imagem, Dados...) entram sem mudar o núcleo.
- A escolha do modo e o último modo usado ficam em `portable/config/settings.json`.

*Projetos recentes (✚ 4.05, parte técnica)*
- Clicar em um projeto abre a pasta no **explorador do próprio UDS** (mesmo comportamento de *Abrir pasta…*), dentro do modo guardado.
- A lista se atualiza sozinha: ao abrir uma pasta, abrir ou salvar um arquivo dentro dela, ela sobe para o topo. Sem duplicados; guarda os últimos 12.
- Pasta que não existe mais (apagada, pendrive removido) aparece esmaecida, com aviso na barra de status ao clicar, e pode ser removida da lista pelo botão direito (*Remover da lista*).
- A lista fica em `portable/config/settings.json` (campo `recentes`), então acompanha o modo portátil.
- Módulo puro `src/recentes.js` (adicionar, ordenar, limitar, remover), testado.

*Código da página inicial e dos modos*
- `src/inicio.js` (página inicial), `src/recentes.js` (módulo puro) e `src/modos/` (`registro.js`, `universal.js`, `texto.js`).
- O Modo Universal só **chama** a tela atual; nenhum arquivo existente é reescrito.

*Visualizador de vídeo (1.40, pré-requisito)*
- Novo módulo `src/visualizadores/video.js`: toca MP4, WebM, OGV, MOV e M4V que o sistema decodificar, com tocar/pausar, posição, volume, velocidade, tela cheia e dados técnicos.
- Formatos que o WebView não toca (MKV, AVI, WMV, FLV...) mostram o aviso e as informações do arquivo, como o áudio já faz.
- Atalhos iguais aos do player de áudio (`Espaço`, `←` `→`, `↑` `↓`, `M`).

*Visualizar (✚ 1.45)*
- Novo item **Visualizar** no botão direito de **qualquer arquivo ou pasta** do explorador.
- Abre uma **janela de prévia flutuante** (mesmo estilo e comportamento da caixa de Configurações: arrasta, redimensiona, fecha com `Esc`), sem abrir aba e sem alterar nada.
- Suporte:
  - **Imagens:** reaproveita o visualizador de imagens (zoom, rotação, ajuste).
  - **Áudio:** reaproveita o player (forma de onda, etiquetas, controles).
  - **Vídeo:** reaproveita o novo visualizador de vídeo.
  - **Texto e código:** leitura com numeração de linhas e realce, somente leitura.
  - **Pastas:** lista do conteúdo (ícone, nome, tipo, tamanho e data), contagem de itens e, quando a pasta tem imagens, miniaturas.
  - **Documentos:** PDF assim que o visualizador da 1.70 existir; DOCX, XLSX, PPTX, ODT e afins mostram a tela de formato reconhecido (nome, tipo, tamanho) com o botão **Abrir como texto**.
- A prévia usa o **mesmo registro de visualizadores**: qualquer visualizador futuro (3D, CSV, Markdown) passa a funcionar no *Visualizar* sem mudança extra.
- Arquivos acima do limite de cada visualizador seguem as mesmas mensagens que já existem (por exemplo, o aviso dos 40 MB no áudio).

**Melhorado**
- O botão direito do explorador agora mostra *Visualizar* no topo; os itens atuais (novo arquivo, nova pasta, renomear, excluir) continuam iguais e na mesma ordem.

**Núcleo (Rust)**
- Comando `path_exists` (para marcar recentes que sumiram).
- Comando `dir_summary` (contagem e tamanho do conteúdo de uma pasta, sem descer em subpastas).

**Testes**
- `tests/recentes.test.js`: ordem, duplicados, limite, fixados, remoção, modo guardado, entrada corrompida em `settings.json`.
- `tests/modos.test.js`: registro de modos, troca sem perder abas nem alterações, e **Universal idêntico à tela atual**.
- Teste de que o menu de contexto mantém os itens antigos.
- Teste Rust dos dois comandos novos.

---

## 1.4.1 — Markdown em 2 modos e editor de texto com prévia (adianta a 1.70)

O editor de texto atual (abas, numeração de linhas, realce, `Ctrl+S`) **continua igual**. Esta versão acrescenta a leitura formatada dos arquivos Markdown (`.md`, `.markdown`), como o GitHub mostra o `README.md`.

**Novo**
- Os botões Código / Visualização / Dividido ficam no HUD do **Modo Texto** e também na barra do editor no Modo Universal.
- **Dois modos de leitura para cada Markdown**, escolhidos por botões no topo da aba:
  - **Código:** o texto puro, no editor atual, editável.
  - **Visualização:** o texto formatado, como no GitHub (somente leitura).
  - **Dividido:** código à esquerda e visualização à direita, com a prévia atualizando enquanto você digita e a rolagem sincronizada.
- Atalho para alternar entre código e visualização: `Ctrl+Shift+V`. O modo escolhido fica salvo por arquivo e como padrão em *Configurações → Editor* (padrão sugerido: **Visualização** ao abrir um `.md`, **Código** ao reabrir como texto).
- **O que a visualização mostra** (estilo GitHub):
  - títulos, negrito, itálico, tachado, citações, listas e linhas horizontais;
  - **listas de tarefas** (`- [x]`) e **tabelas**;
  - **blocos de código** com o mesmo realce de sintaxe do editor;
  - links, imagens (inclusive caminhos relativos, como `assets-design/logo-uds.png`) e HTML simples (`<details>`, `<br>`, `<img>`);
  - links internos para títulos (`#comandos-do-programa`) e **sumário lateral** opcional;
  - emojis (✅ ⚠️ 🔎 🎨) e blocos de aviso (`> [!NOTE]`, `> [!WARNING]`).
- **Links no documento:** `.md` relativo abre em outra aba do UDS (como clicar em `ReadMe/audio.md` no README); link externo abre no navegador do sistema; links para outros arquivos do projeto abrem no UDS.
- **Cores e fontes seguem o tema** (escuro e claro) e o zoom da interface; nada de cores fixas.
- O mesmo modo aparece no **Visualizar** (botão direito → *Visualizar* em um `.md` abre direto na visualização formatada).
- O comentário `<!-- formatos:inicio -->` do README e outros comentários HTML não aparecem na visualização.

**Segurança e portabilidade**
- O HTML dentro do Markdown é **filtrado** antes de aparecer (sem scripts, sem eventos `onclick`, sem `iframe`), porque o conteúdo pode vir de qualquer pasta.
- O conversor de Markdown vai **embutido no programa** (nada de internet), mantendo o modo portátil.

**Código**
- `src/visualizadores/markdown.js` (visualizador no registro, `match` por `.md` e `.markdown`).
- `src/markdown.js`: módulo puro (Markdown → HTML, caminhos relativos, links, sumário), testado sem a janela.
- Biblioteca de conversão e filtro de HTML embutidas em `src/vendor/` (sugestão: `marked` + `DOMPurify`; veja decisão na seção 5).
- O realce dos blocos de código reaproveita `core.js`.

**Testes**
- `tests/markdown.test.js`: tabelas, listas de tarefas, blocos de código, links relativos e internos, imagens relativas, HTML perigoso removido (`<script>`, `onerror`, `javascript:`).
- Teste com **todos os `.md` do projeto** (`README.md` e `ReadMe/*.md`): convertem sem erro e mantêm todos os títulos e tabelas.
- Teste de que `.md` em modo Código continua abrindo e salvando como texto, sem alteração do arquivo.

---

## 1.5.0 — Editor de áudio e Modo Áudio (✚ 2.70)

**Novo**
- **Modo Áudio** (escolhido na página inicial ou com `Ctrl+3`): o editor de áudio ocupa a tela inteira, com HUD só de áudio:
  - forma de onda grande com régua de tempo e zoom;
  - barra de ferramentas (cortar, recortar, remover trecho, fade, desfazer e refazer);
  - medidor de nível e controles de reprodução;
  - lista lateral só com os **áudios da pasta**, para trocar de arquivo com um clique.
- O mini editor do botão direito (*Editar áudio*) e o Modo Áudio são **o mesmo editor** em dois lugares; um botão **Expandir para o Modo Áudio** leva a edição aberta para a tela cheia.
- Item **Editar áudio** no botão direito de arquivos de áudio (MP3, WAV, FLAC, OGG, Opus, AAC, M4A).
- Mini editor em janela flutuante, com:
  - **Forma de onda** em resolução cheia, com seleção por arrastar e marcadores de início e fim ajustáveis (campo de tempo e setas).
  - **Cortar** (dividir no ponto do cursor), **Recortar** (manter só a seleção) e **Remover trecho** (apagar a seleção e unir as pontas).
  - **Desfazer** e **Refazer** (`Ctrl+Z`, `Ctrl+Y`), ilimitados na sessão.
  - **Pré-visualizar** o resultado completo, ou só a seleção, e **ouvir a emenda** (2 s antes e depois do ponto de remoção), sem gravar nada.
  - Fade curto automático (5 ms) nas emendas, para não estalar.
- **Salvar como cópia**: sempre cria um arquivo novo, `nome (editado).wav`, na mesma pasta; se já existir, `nome (editado 2).wav`. O arquivo original **nunca** é aberto para escrita.
- Depois de salvar, o explorador atualiza e oferece **Abrir cópia**.
- Atalhos: `Espaço` toca, `[` e `]` marcam início e fim, `Delete` remove a seleção.

**Formato de saída (limite desta versão)**
- A cópia é salva em **WAV 16 bits**, com a taxa e os canais do original. WAV é gravado direto pela interface, sem programas extras e sem perda.
- Salvar em MP3, FLAC ou OGG exige um codificador. Fica para a 1.6.0, junto com o FFmpeg (ele é necessário ali de qualquer forma). O editor já deixa o seletor de formato pronto, com as opções ainda não disponíveis desativadas e explicadas.

**Limites**
- Até **200 MB / ~20 min** por arquivo, porque o editor decodifica o áudio inteiro na memória (o player continua tocando arquivos grandes, e a edição avisa quando passar do limite).
- Formatos que o sistema não decodifica (WMA, AIFF, MIDI...) não abrem no editor; aparece o aviso e o item fica desativado no menu.
- As etiquetas (capa, título...) não são copiadas para o WAV nesta versão.

**Núcleo (Rust)**
- Comando `write_file_bytes` (grava bytes em um caminho novo; **recusa sobrescrever** um arquivo que já exista).
- Comando `unique_path` (gera `nome (editado N)` sem colisão).

**Código**
- `src/editores/audio.js` (tela), `src/audioedit.js` (lista de trechos, cortes, desfazer) e `src/wav.js` (gravação do WAV). Os dois últimos são módulos puros e testados.

**Testes**
- `tests/audioedit.test.js`: cortar, recortar e remover com duração exata, emendas sem estalo, desfazer e refazer.
- Verificação do WAV gerado com o **ffprobe**, como nos testes de áudio atuais (duração, taxa, canais, bits).
- Teste de que o arquivo original continua com o mesmo hash depois de salvar.

---

## 1.6.0 — Editor de vídeo e Modo Vídeo (✚ 2.80)

**Novo**
- **Modo Vídeo** (`Ctrl+4`): o editor de vídeo ocupa a tela, com HUD só de vídeo:
  - prévia grande;
  - linha do tempo com miniaturas e marcadores de início e fim;
  - ferramentas de cortar, manter seleção, remover trecho e salvar;
  - painel com os dados do vídeo e lista lateral com os **vídeos da pasta**.
- O mini editor do botão direito (*Editar vídeo*) e o Modo Vídeo são o mesmo editor; há o botão **Expandir para o Modo Vídeo**.
- Item **Editar vídeo** no botão direito de arquivos de vídeo (MP4, MOV, M4V, WebM, MKV, AVI...).
- Mini editor em janela flutuante, com:
  - Player com **faixa do tempo** e miniaturas de quadros.
  - **Início e fim**: marcadores arrastáveis, campos de tempo e atalhos `I` (início) e `O` (fim).
  - **Cortar** (dividir no ponto atual), **Manter seleção** e **Remover trecho**.
  - **Desfazer** e **Refazer**.
  - **Pré-visualizar o resultado antes de salvar**: o player toca só os trechos mantidos, pulando os removidos (sem gerar arquivo).
- **Salvar como cópia**: sempre um arquivo novo, `nome (editado).ext`, na mesma pasta. O original **nunca é alterado**. Barra de progresso e botão **Cancelar** (apaga a cópia incompleta).
- Dois modos de salvar:
  - **Rápido (sem recodificar):** instantâneo, sem perda de qualidade, mas o corte cai no quadro-chave mais próximo.
  - **Preciso (recodificar):** corte no quadro exato, mais lento.
- Mantém o formato de origem.
- Mesma opção de formato do editor de áudio ativada: **MP3, FLAC, OGG e Opus** para as cópias de áudio.

**FFmpeg**
- O corte real usa o **FFmpeg** (veja decisões na seção 5). O UDS procura em `tools/ffmpeg/` ao lado do executável. Sem ele, *Editar vídeo* mostra como instalar e o restante do programa continua igual.
- O núcleo executa o FFmpeg com argumentos montados pelo próprio UDS (nunca com texto digitado pelo usuário) e só em arquivos escolhidos por ele.

**Núcleo (Rust)**
- Comandos `ffmpeg_status`, `ffmpeg_run_cut` (com eventos de progresso) e `ffmpeg_cancel`.
- Função pura de montagem dos argumentos (cortar, manter, remover = cortar as duas partes e unir), testada.

**Testes**
- Teste Rust dos argumentos para cada operação e dos nomes de saída.
- Testes com amostras reais de vídeo: duração do resultado conferida com o **ffprobe**, original intacto (hash), cancelamento sem deixar arquivo.

---

## 1.6.x — Documentos no Visualizar
- **PDF** na janela de prévia, assim que o visualizador da etapa 1.70 existir (sem trabalho extra no menu).
- CSV/JSON em tabela (1.80) entra na prévia automaticamente pelo registro. O Markdown já vem da 1.4.1.

---

## 4. Documentação a atualizar quando cada versão sair

1. `ReadMe/atualizacoes.md`: seção da versão, no topo.
2. `README.md`: lista "O que já funciona", tabela de comandos (botão direito do explorador), seção Formatos de arquivo (vídeo passa de 🔎 para ✅ nos formatos que tocam) e o roteiro (marcar ✚ 4.02 Modos de trabalho, 1.40, ✚ 1.45, parte Markdown da 1.70, ✚ 2.70, ✚ 2.80 e ✚ 4.05; documentos Markdown passam de ✅ texto para ✅ visualizador).
3. Novos guias, no mesmo estilo de `audio.md`: `ReadMe/modos.md`, `ReadMe/inicio.md`, `ReadMe/markdown.md`, `ReadMe/visualizar.md`, `ReadMe/editor-audio.md`, `ReadMe/editor-video.md` e `ReadMe/video.md`.
4. `ReadMe/estrutura.md`: pastas novas (`src/editores/`, `src/modos/`, `tools/ffmpeg/`) e comandos novos do núcleo.
5. `ReadMe/ideias.md`: ideia nº 2 (tela de projetos) passa a "Pronta" na 1.4.0, com a página inicial, os recentes e os fixados; nova ideia dos Modos de trabalho.
6. Versão em `package.json`, `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json` e `VERSION` em `src/app.js`.

---

## 5. Decisões necessárias (pedem sua confirmação)

1. **FFmpeg no editor de vídeo.** Não dá para cortar vídeo com segurança só com JavaScript no WebView. Opções:
   - **A (recomendada):** FFmpeg em `tools/ffmpeg/`, ao lado do executável, dentro do ZIP portátil. Mantém o programa portátil e sem instalação. Acrescenta cerca de 70–100 MB ao ZIP. Use uma versão LGPL e inclua a licença.
   - **B:** pacote separado ("UDS + FFmpeg") e o ZIP principal continua leve; o editor pede o download na primeira vez.
   - **C:** usar o FFmpeg que já estiver instalado no computador (sem garantia de existir).
2. **Formato de saída do áudio na 1.5.0.** WAV (sem perda, grande) já na 1.5.0, e MP3/FLAC/OGG só com o FFmpeg na 1.6.0. Alternativa: antecipar o FFmpeg para a 1.5.0.
3. **Conversor de Markdown.** Recomendado: `marked` (conversão, com tabelas e listas de tarefas do GitHub) + `DOMPurify` (filtro de segurança), ambos embutidos em `src/vendor/`, licença MIT. Alternativa: escrever um conversor próprio (menos peso, mas menos fiel ao GitHub e mais trabalho de manutenção).
4. **Modo padrão ao abrir um `.md`:** Visualização (sugerido, como no GitHub) ou Código (como hoje)?
5. **Modo ao clicar em um projeto recente.** Recomendado: abrir no modo em que ele foi usado da última vez. Alternativa: sempre abrir no Universal.
6. **Nomes dos modos.** Sugestão: *Universal*, *Texto*, *Áudio*, *Vídeo*. Os atalhos `Ctrl+1` a `Ctrl+4` servem?
7. **Cartões da página inicial.** Os 4 cartões de função ficam acima ou abaixo da lista de recentes? Sugestão: recentes em destaque à esquerda e as funções à direita.
8. **"Visualizar" em janela flutuante** (padrão das Configurações) ou em um painel fixo dentro do UDS? A proposta usa a janela flutuante por já existir e por não mexer no layout.

---

## 6. Confirmar no código antes de implementar

- Como o **layout** (explorador, abas, notas, painel inferior) é montado e como os 3 botões de mostrar e esconder funcionam: os modos serão presets em cima deles.
- Onde fica hoje a **tela inicial com recentes** e em que formato elas são guardadas (para migrar sem perder o que já existe).
- Como o **menu de contexto** do explorador é montado em `app.js` (lista de itens, função que o abre), para só acrescentar entradas.
- A **assinatura de `ctx`** em `registerViewer`, para a janela de prévia usar o mesmo contêiner e as mesmas funções.
- O **escopo do protocolo `asset`** em `tauri.conf.json` e as permissões em `src-tauri/capabilities/`: precisam cobrir qualquer pasta aberta, para vídeo, áudio e prévia.
- Se `write_file` aceita **bytes** ou só texto (senão, entra `write_file_bytes`).
- Se o **WebView2** do Windows toca H.264/AAC em MP4 (o README já diz que depende dos codecs do sistema); isso define quais vídeos o editor consegue pré-visualizar.

---

## 7. Garantias (regras de não regressão)

- Nenhum comando, atalho, visualizador ou menu atual muda de comportamento; só entram itens novos.
- Os editores **nunca escrevem no arquivo original**: o núcleo recusa gravar em caminho que já existe e a cópia sempre recebe nome novo.
- Cores, fontes, ícones e janelas flutuantes usam os **temas** (`theme.json`) e os estilos atuais; nada de cores fixas.
- O **Modo Universal** é a tela atual, sem mudanças. Quem não usa os outros modos não percebe nenhuma diferença, além da página inicial (que pode ser desligada).
- Sem FFmpeg, o programa inteiro continua funcionando; só *Editar vídeo* avisa.
- Cada versão só avança com `npm test` e `cargo test` passando, como no roteiro.
