# Universal Development Studio (UDS)

*One Studio. Unlimited Possibilities.*

O UDS é um ambiente **universal e portátil** para desenvolvimento, edição e visualização de arquivos. Em uma única janela, você abre uma pasta, edita código e vê imagens (e, nas próximas versões, modelos 3D, PDF e mais). Ele roda direto de uma pasta ou pendrive, sem instalação, e guarda tudo ao lado do executável.

A interface segue o estilo dos editores modernos, com explorador de arquivos à esquerda, abas e editor no centro, painel inferior e, à direita, um **bloco de notas por projeto**.

**Versão atual:** 1.4.2 · **Plataforma:** Windows (Linux e macOS nas etapas 9.00 em diante) · **Licença:** MIT

## O que já funciona
- Abrir uma pasta do computador e navegar pelos arquivos.
- Criar, renomear e excluir arquivos e pastas.
- Abas e editor de texto com numeração de linhas e destaque de sintaxe.
- Visualizador de imagens (PNG, JPG, GIF, WEBP, BMP, ICO, SVG) com zoom, rotação e ajuste.
- **Lista completa de formatos** com o que cada um faz hoje (seção "Formatos de arquivo").
- **Player de áudio** (MP3, WAV, FLAC, OGG, Opus, AAC, M4A) com capa, etiquetas, forma de onda clicável, velocidade e dados técnicos (veja `ReadMe/audio.md`).
- **Página inicial** com os projetos recentes (fixáveis, que voltam no modo em que foram usados) e a escolha da função; **modos de trabalho** (Universal e Texto, com `Ctrl+1` e `Ctrl+2`; Áudio e Vídeo vêm com os editores); e **Visualizar**, uma prévia flutuante pelo botão direito de qualquer arquivo ou pasta, sem abrir aba (veja `ReadMe/inicio-e-modos.md` e `ReadMe/visualizar.md`).
- **Tela de loading** na abertura: painel com o logo montando, o que está sendo carregado e uma barra de progresso. Some sozinha, com clique ou com `Esc`, e pode ser desligada em *Configurações → Aparência* (veja `ReadMe/loading.md`).
- **Player de vídeo** (MP4, WebM, MKV, MOV e 3GP, conforme os codecs do sistema) com controles, passo por quadro, tela cheia e dados técnicos: codec, resolução, fps, taxa de bits e rotação (veja `ReadMe/video.md`).
- **Identificação de arquivos pelo conteúdo**: um PNG chamado `foto.txt`, um script sem extensão ou um PDF são reconhecidos ao abrir (veja `ReadMe/deteccao.md`).
- **Configurações em uma caixa flutuante** (engrenagem ou menu do logo), com a lista de **Tipos de arquivo**.
- **Ícones para mais de 200 extensões**, em 2 estilos (preto e branco, de acordo com o tema), e **ícones de pasta** (fechada e aberta).
- **Temas lidos de arquivos `theme.json`** (escuro, claro e um exemplo), com recarga na hora; você cria o seu seguindo o guia em `themes/`.
- Tamanho da fonte e zoom.
- Bloco de notas por projeto, com vínculo a arquivos.
- Modo portátil: configurações e notas ficam na pasta `portable/`.

Os ícones de Busca, Git, Execução e Extensões e o painel Terminal já aparecem na tela, mas só ganham função nas versões indicadas no roteiro abaixo.

## Usar (portátil)
1. Abra **Releases** no GitHub e baixe o ZIP do Windows.
2. Extraia em qualquer pasta ou pendrive.
3. Execute `UniversalDevelopmentStudio.exe`.

Para atualizar, extraia a nova versão por cima, mantendo a pasta `portable/`. Requisito no Windows: WebView2 Runtime (já vem no Windows 10 e 11 atualizados). Se aparecer "O Windows protegeu seu PC", clique em *Mais informações* e depois em *Executar assim mesmo*, porque o programa ainda não tem assinatura digital.

## Política de assinatura de código (Code signing policy)

**Situação: pedido ainda não aprovado. Hoje os executáveis do UDS _não_ são assinados** (por isso o Windows mostra o aviso descrito em *Usar (portátil)*). Estamos preparando o pedido de assinatura gratuita para projetos de código aberto da SignPath Foundation. Quando for aprovado, esta seção passa a dizer: *"Free code signing provided by [SignPath.io](https://about.signpath.io), certificate by [SignPath Foundation](https://signpath.org)"*.

- **O que será assinado:** só o executável `UniversalDevelopmentStudio.exe` do pacote portátil para Windows, publicado em **Releases**.
- **Como:** o executável é compilado pelo GitHub Actions a partir deste repositório público, em máquinas do próprio GitHub. Somente o resultado dessa compilação é enviado para assinatura, e cada versão precisa de aprovação manual. A chave privada fica com a SignPath; o projeto não guarda chave nenhuma.
- **Equipe e papéis** (projeto com um mantenedor): **Autor** (altera o código sem revisão), **Revisor** (revisa as contribuições de quem não tem acesso de escrita) e **Aprovador** (aprova cada pedido de assinatura): [SEU-USUARIO](https://github.com/SEU-USUARIO) <!-- troque SEU-USUARIO pelo seu usuário do GitHub antes de enviar o pedido -->. Toda contribuição externa (Pull Request) é revisada antes de entrar.
- **Verificação:** cada ZIP em Releases tem um arquivo `.sha256` ao lado. Baixe só da página oficial de Releases deste repositório.
- **Política de privacidade:** este programa não transfere nenhuma informação a outros sistemas em rede, a menos que o usuário peça especificamente. O UDS não tem telemetria, não procura atualizações sozinho e só lê e grava os arquivos que você abre; suas configurações ficam na pasta `portable/` ao lado do programa.
- **Instalar e desinstalar:** não há instalador. Para remover, apague a pasta do programa. O UDS não altera as configurações do Windows.

## Comandos do programa
Tudo isso está no menu que abre ao clicar no **logo do UDS** (canto superior esquerdo).

| Comando | O que faz | Atalho |
|---|---|---|
| Abrir pasta… | Escolhe a pasta do projeto; ela aparece no explorador | `Ctrl+O` |
| Abrir arquivo… | Abre um arquivo avulso em uma aba | |
| Novo arquivo | Cria um arquivo vazio na pasta do projeto e o abre | |
| Nova pasta | Cria uma pasta no projeto | |
| Salvar | Salva todos os arquivos alterados (marcados com ●) | `Ctrl+S` |
| Página inicial | Volta à tela com os projetos recentes e a escolha da função | Menu do logo → Arquivo |
| Trocar o modo de trabalho | Universal, Texto (Áudio e Vídeo em breve) | `Ctrl+1` a `Ctrl+4` |
| Visualizar | Prévia flutuante de um arquivo ou pasta, sem abrir aba | Botão direito no explorador |
| Reabrir como texto | Abre como texto um arquivo que o UDS tratou como binário ou imagem | |
| Fechar aba | Fecha a aba; se houver alterações, pergunta se salva | |
| Alternar tema claro/escuro | Alterna entre o tema claro e o escuro padrão; os ícones mudam de cor junto | |
| Recarregar temas | Lê de novo a pasta `themes/` (use depois de criar ou editar um tema) | |
| Abrir pasta de temas | Abre a pasta `themes/` no explorador, para editar os `theme.json` | |
| Barra lateral / Painel inferior / Notas | Mostra ou esconde cada área (também pelos 3 botões no canto superior direito) | |
| Aumentar / Diminuir zoom | Muda o tamanho de toda a interface | `Ctrl +` / `Ctrl -` |
| Zoom padrão | Volta a 100% (clicar em "100%" no topo também) | `Ctrl 0` |
| **Configurações…** | Abre a caixa flutuante de configurações (tema, ícones, zoom, fonte, tipos de arquivo, atalhos) | `Ctrl+,` |
| Tipos de arquivo… | Abre a caixa direto na lista de tipos de arquivo, com ícone, nome e extensões | |
| Sobre o UDS | Abre a caixa na aba Sobre (versão, licença, pastas usadas) | |

**Player de áudio** (com o player em foco): `Espaço` toca/pausa, `←` `→` voltam/avançam 5 s, `↑` `↓` mudam o volume, `M` silencia. Clique na forma de onda para ir a um ponto.

**Outros atalhos e gestos**
- `Ctrl` + roda do mouse: zoom da interface.
- `Tab` no editor: insere 2 espaços.
- Botão direito no explorador: novo arquivo, nova pasta, renomear, excluir.
- Botão ⋯ no topo do explorador: novo arquivo, nova pasta, atualizar.
- Notas: **＋ Nova nota** cria; duplo clique no título renomeia; **＋ Vincular arquivo atual** adiciona um atalho `@arquivo` que abre o arquivo ao clicar; botão direito no atalho remove o vínculo.

**Configurações** (engrenagem no canto inferior esquerdo, ou *Configurações…* no menu do logo): uma caixa flutuante que dá para arrastar, redimensionar e deixar aberta enquanto você trabalha. `Esc` fecha. Abas:
- **Aparência:** tema (com *Recarregar* e *Abrir pasta de temas*), estilo dos ícones (Estilo 1 padrão ou Estilo 2), zoom e *Restaurar padrões*.
- **Editor:** tamanho da fonte.
- **Tipos de arquivo:** lista de tipos com ícone, nome e extensões, e filtro.
- **Atalhos**, **Extensões** e **Sobre:** informações (a personalização chega nas etapas 4.70 e 6.00 em diante).

## Comandos para desenvolver
Requisitos: [Node.js 20+](https://nodejs.org), [Rust](https://rustup.rs) e os [pré-requisitos do Tauri](https://tauri.app/start/prerequisites/).

| Comando | O que faz |
|---|---|
| `npm install` | Baixa as ferramentas de compilação (Tauri CLI) |
| `npm run icons` | Gera o ícone do **programa** (`.ico`, `.icns`, `.png`) a partir de `app-icon.png`. Não tem relação com os ícones de arquivo |
| `npm test` | Roda os testes da interface: ícones, temas e identificação de arquivos pelo conteúdo |
| `python tests/gerar_amostras_audio.py` | Gera os áudios reais de amostra e o gabarito do ffprobe usados nos testes de áudio. Precisa de `ffmpeg`, `ffprobe` e `pip install pillow` |
| `python tests/gerar_amostras.py` | Gera os arquivos reais de amostra usados nos testes de detecção. Precisa de `pip install pillow` |
| `cargo test --manifest-path src-tauri/Cargo.toml` | Roda os testes do núcleo em Rust |
| `npm run dev` | Abre o UDS em modo de desenvolvimento |
| `npm run build` | Compila o executável em `src-tauri/target/release/` |
| `python scripts/gerar_icone.py SIGLA nome 12_extras` | Gera os 4 ícones (2 estilos, preto e branco) de um tipo de arquivo novo. Exemplo: `GML gml`. Precisa de `pip install pillow` |
| `python scripts/package.py windows` | Depois do build: monta a pasta portátil e o ZIP em `dist-portable/` |
| `git tag v1.4.2` e `git push origin v1.4.2` | Publica uma versão: o GitHub Actions compila, testa, gera o ZIP e o coloca em **Releases** |

## Guias
**Como criar um tema:** [`themes/COMO-CRIAR-UM-TEMA.md`](themes/COMO-CRIAR-UM-TEMA.md)

**Na pasta `ReadMe/`:**
| Arquivo | Conteúdo |
|---|---|
| [`ReadMe/icones.md`](ReadMe/icones.md) | Os 2 estilos de ícone, preto e branco por tema, como adicionar ou trocar ícones e a lista completa por extensão |
| [`ReadMe/audio.md`](ReadMe/audio.md) | O player de áudio: controles, formatos, etiquetas lidas, limites e testes |
| [`ReadMe/inicio-e-modos.md`](ReadMe/inicio-e-modos.md) | A página inicial, os projetos recentes e os modos de trabalho: como funcionam, atalhos, limites e como criar um modo novo |
| [`ReadMe/visualizar.md`](ReadMe/visualizar.md) | O Visualizar: prévia flutuante pelo botão direito, o que mostra de cada tipo de arquivo, limites e testes |
| [`ReadMe/assinatura.md`](ReadMe/assinatura.md) | Assinatura de código (SignPath Foundation): requisitos, texto do pedido em inglês, passos antes e depois da aprovação |
| [`ReadMe/loading.md`](ReadMe/loading.md) | A tela de loading: o que mostra, como pular ou desligar, limites e testes |
| [`ReadMe/video.md`](ReadMe/video.md) | O player de vídeo: controles, formatos, dados técnicos lidos, limites e testes |
| [`ReadMe/proposta-modos-editores.md`](ReadMe/proposta-modos-editores.md) | Proposta (ainda não feita): página inicial, modos de trabalho, Visualizar, Markdown e editores de áudio e vídeo |
| [`ReadMe/deteccao.md`](ReadMe/deteccao.md) | Como o UDS descobre o tipo de um arquivo pelo conteúdo, formatos reconhecidos e limites |
| [`ReadMe/icones-personalizados.md`](ReadMe/icones-personalizados.md) | Como um tipo de arquivo ganha ícone para sempre, pacotes de ícones e a área "Tipos de Arquivos" |
| [`ReadMe/ideias.md`](ReadMe/ideias.md) | Ideias e melhorias organizadas por versão |
| [`ReadMe/atualizacoes.md`](ReadMe/atualizacoes.md) | O que mudou em cada versão |
| [`ReadMe/estrutura.md`](ReadMe/estrutura.md) | Pastas, arquitetura, portabilidade e como criar um visualizador |
| [`ReadMe/design.md`](ReadMe/design.md) | Logo, paleta de cores e capturas do design |

<!-- formatos:inicio -->
## Formatos de arquivo
O UDS mostra um **ícone** para todos os formatos desta lista, nos 2 estilos e em preto e branco (veja `ReadMe/icones.md`). Esta seção diz o que cada um faz **hoje** e em que etapa do roteiro chega o restante. Ela é atualizada a cada versão. O editor abre arquivos de texto de até 5 MB.

**Legenda**

| | Significado |
|---|---|
| ✅ | **Abre hoje**: no editor (como texto) ou em um visualizador |
| ⚠️ | Abre no visualizador, mas o sistema não consegue tocar; mostra as informações do arquivo |
| 🔎 | **Reconhecido pelo conteúdo** (mesmo sem extensão ou com a extensão errada) e com ícone, mas ainda sem visualizador. Aparece a tela com o formato e a etapa em que o visualizador chega; **Abrir como texto** continua disponível |
| 🎨 | **Só ícone**: identificado pela extensão; ainda não é reconhecido pelo conteúdo |

**Resumo** (cada linha das listas abaixo conta como um formato)

| Categoria | Formatos | ✅ Abrem hoje | 🔎 / ⚠️ Reconhecidos | 🎨 Só ícone |
|---|---|---|---|---|
| Marcação, configuração e estilização | 14 | 14 | 0 | 0 |
| Linguagens de programação, scripts e runtime | 33 | 30 | 2 | 1 |
| Áudio | 13 | 7 | 6 | 0 |
| Vídeo e animação | 13 | 6 | 7 | 0 |
| Imagens vetoriais e bitmap | 16 | 8 | 6 | 2 |
| Modelos 3D, CAD e animação 3D | 22 | 11 | 5 | 6 |
| Banco de dados | 5 | 1 | 3 | 1 |
| Fontes tipográficas | 5 | 0 | 5 | 0 |
| Documentos e leitura | 11 | 2 | 8 | 1 |
| Compactados e imagens de disco | 9 | 0 | 7 | 2 |
| Executáveis, pacotes e arquivos compilados | 13 | 0 | 12 | 1 |
| **Total** | **154** | **79** | **61** | **14** |

### Marcação, configuração e estilização (texto, 0.60 — feito)

✅ **Abrem hoje, como texto (editor com realce de sintaxe):**  
HTML (.html, .htm) · XML (.xml) · XHTML (.xhtml) · CSS (.css) · SCSS / SASS (.scss, .sass) · LESS (.less) · Markdown (.md, .markdown) · JSON (.json) · YAML (.yml, .yaml) · TOML (.toml) · INI (.ini) · LaTeX (.tex) · SGML (.sgml)

✅ **Abrem hoje no visualizador:**  
SVG (.svg)

> Markdown formatado: 1.70. JSON e CSV em tabela: 1.80.

### Linguagens de programação, scripts e runtime (texto, 0.60 — feito; execução, 2.60)

✅ **Abrem hoje, como texto (editor com realce de sintaxe):**  
JavaScript (.js, .mjs, .cjs) · TypeScript (.ts, .tsx) · JSX (.jsx) · Python (.py, .pyw, .ipynb) · Java (.java) · C (.c, .h) · C++ (.cpp, .hpp, .cc, .cxx) · C# (.cs) · PHP (.php, .phtml) · Ruby (.rb) · Go (.go) · Rust (.rs) · Swift (.swift) · Kotlin (.kt, .kts) · Dart (.dart) · R (.r) · MATLAB (.m) · Perl (.pl) · Scala (.scala) · Lua (.lua) · Elixir (.ex, .exs) · Haskell (.hs) · Clojure (.clj) · Erlang (.erl) · Assembly (.asm, .s) · Shell Script (.sh, .bash, .zsh) · PowerShell (.ps1) · Batch (.bat, .cmd) · SQL (.sql) · GraphQL (.graphql, .gql)

🔎 **Reconhecidos pelo conteúdo, com ícone (ainda sem visualizador):**  
Java compilado (.class, .jar) · WebAssembly (.wasm)

🎨 **Só ícone (identificados pela extensão):**  
Python compilado (.pyc)

> O realce de sintaxe é o mesmo para todas as linguagens (palavras-chave, textos, números e comentários). Executar scripts: 2.60.

### Áudio (1.30 — feito)

✅ **Abrem hoje no visualizador:**  
MP3 (.mp3) · WAV (.wav) · FLAC (.flac) · AAC (.aac) · OGG / Vorbis (.ogg, .oga) · M4A (.m4a) · Opus (.opus)

⚠️ **Abrem no player, mas o sistema não toca (mostra as informações do arquivo):**  
WMA (.wma) · AIFF (.aiff, .aif) · ALAC (.alac) · MIDI (.mid, .midi) · AMR (.amr) · PCM (.pcm)

> Etiquetas, capa e dados técnicos são lidos em MP3, FLAC, OGG, Opus, M4A e WAV. A reprodução depende dos codecs do sistema: MP3, WAV, FLAC, OGG e Opus foram testados tocando de verdade; AAC e M4A dependem dos codecs do Windows (WebView2). Um conversor para os formatos que o sistema não toca está previsto nos plugins.

### Vídeo e animação (1.40 — feito)

✅ **Abrem hoje no visualizador de vídeo (o sistema toca, conforme os codecs):**  
MP4 (.mp4, .m4v) · MKV (.mkv) · MOV (.mov) · WebM (.webm) · 3GP (.3gp)

✅ **Abrem hoje, como texto (editor com realce de sintaxe):**  
Lottie / BodyMovin (.json)

⚠️ **Abrem no visualizador, mas o sistema não toca (mostra as informações do arquivo):**  
AVI (.avi) · WMV (.wmv) · FLV (.flv, .f4v) · MPEG / MPG (.mpeg, .mpg) · OGV (.ogv) · M2TS (.m2ts) · VOB (.vob)

> Os dados técnicos (contêiner, codecs, resolução, fps, duração, taxa de bits, rotação, título) são lidos em MP4/MOV/3GP, WebM/MKV, AVI, FLV e OGV; em MPEG, M2TS, VOB e WMV aparecem só o formato, o tamanho e o que o player informar. A reprodução depende do WebView2: **WebM foi testado tocando de verdade** (Chromium); MP4 com H.264/AAC é o caso mais comum no Windows, mas ainda **precisa ser confirmado no Windows**. HEVC (H.265) depende da extensão de vídeo do Windows. OGV (Theora) abre, mas o Chromium recente toca só o áudio: o player avisa "sem imagem". Um conversor para os formatos que o sistema não toca está previsto nos plugins.
>
> O Lottie abre como texto e é reconhecido pelo conteúdo. A extensão `.ts` continua sendo TypeScript; vídeo MPEG-TS é reconhecido pelo conteúdo e abre aqui mesmo com a extensão `.ts` ou `.mts`.

### Imagens vetoriais e bitmap (0.70 para os formatos comuns — feito)

✅ **Abrem hoje no visualizador:**  
JPEG / JPG (.jpg, .jpeg) · PNG (.png) · GIF (.gif) · WebP (.webp) · AVIF (.avif) · BMP (.bmp) · ICO (.ico) · SVG (.svg)

🔎 **Reconhecidos pelo conteúdo, com ícone (ainda sem visualizador):**  
TIFF (.tif, .tiff) · HEIC / HEIF (.heic, .heif) · PSD (.psd, .psb) · AI (.ai) · EPS (.eps) · RAW de câmeras (.cr2, .cr3, .nef, .arw, .dng)

🎨 **Só ícone (identificados pela extensão):**  
INDD (.indd) · RAW genérico (.raw)

> O AVIF abre se o sistema decodificar; se não, o visualizador avisa. TIFF, HEIC e PSD ainda precisam de conversão. RAW de câmeras (CR2, DNG, NEF, ARW) e CR3 são reconhecidos pelo conteúdo, sem gerar aviso de extensão errada.

### Modelos 3D, CAD e animação 3D (1.50; os demais, via plugins)

✅ **Abrem hoje, como texto (editor com realce de sintaxe):**  
OBJ (.obj, .mtl) · STL (.stl, só o formato texto) · GLTF (.gltf) · STEP / STP (.step, .stp) · IGES / IGS (.iges, .igs) · DAE / Collada (.dae) · DXF (.dxf) · PLY (.ply, só o formato texto) · USDA (.usda) · VRML / X3D (.wrl, .x3d) · Maya ASCII (.ma)

🔎 **Reconhecidos pelo conteúdo, com ícone (ainda sem visualizador):**  
GLB (.glb) · FBX (.fbx, binário) · BLEND (.blend) · DWG (.dwg) · USDZ (.usdz)

🎨 **Só ícone (identificados pela extensão):**  
STL binário (.stl) · 3DS (.3ds) · MAX (.max) · Maya binário (.mb) · C4D (.c4d) · USD / USDC (.usd, .usdc)

> Hoje os formatos em texto abrem no editor, sem a visualização 3D. O visualizador 3D (com biblioteca pronta) é a etapa 1.50.

### Banco de dados (plugins, 6.50)

✅ **Abrem hoje, como texto (editor com realce de sintaxe):**  
MySQL Export (.sql)

🔎 **Reconhecidos pelo conteúdo, com ícone (ainda sem visualizador):**  
SQLite (.sqlite, .db, .db3) · Access (.accdb, .mdb) · Parquet (.parquet)

🎨 **Só ícone (identificados pela extensão):**  
MongoDB BSON (.bson)

> O dump do MySQL abre como texto e é reconhecido pelo conteúdo (ícone do MySQL).

### Fontes tipográficas (plugins, 6.70)

🔎 **Reconhecidos pelo conteúdo, com ícone (ainda sem visualizador):**  
TTF (.ttf) · OTF (.otf) · WOFF (.woff) · WOFF2 (.woff2) · EOT (.eot)

### Documentos e leitura (PDF e Markdown, 1.70; os demais, via plugins)

✅ **Abrem hoje, como texto (editor com realce de sintaxe):**  
TXT (.txt) · RTF (.rtf, mostra o código do RTF)

🔎 **Reconhecidos pelo conteúdo, com ícone (ainda sem visualizador):**  
PDF (.pdf) · DOC / DOCX (.doc, .docx) · XLS / XLSX (.xls, .xlsx) · PPT / PPTX (.ppt, .pptx) · ODT (.odt) · ODS (.ods) · ODP (.odp) · EPUB (.epub)

🎨 **Só ícone (identificados pela extensão):**  
AZW3 / MOBI (.azw3, .mobi)

### Compactados e imagens de disco (ZIP, 1.90)

🔎 **Reconhecidos pelo conteúdo, com ícone (ainda sem visualizador):**  
ZIP (.zip) · RAR (.rar) · 7Z (.7z) · TAR (.tar) · TAR.GZ / TGZ (.tar.gz, .tgz) · GZ (.gz) · BZ2 (.bz2)

🎨 **Só ícone (identificados pela extensão):**  
ISO (.iso) · IMG (.img)

### Executáveis, pacotes e arquivos compilados (só identificação e ícone, 1.20 — feito)

🔎 **Reconhecidos pelo conteúdo, com ícone (ainda sem visualizador):**  
EXE (.exe) · MSI (.msi) · APK / XAPK (.apk, .xapk) · AAB (.aab) · PKG (.pkg) · DEB (.deb) · RPM (.rpm) · AppImage (.appimage) · BIN (.bin) · DLL (.dll) · SO (.so) · DYLIB (.dylib)

🎨 **Só ícone (identificados pela extensão):**  
DMG (.dmg)

> Por segurança, o UDS identifica e mostra o ícone, mas não executa nem abre esses arquivos.

Algumas extensões servem a mais de um formato: `.ts` (TypeScript e MPEG-TS), `.json` (JSON e Lottie), `.sql` (SQL e MySQL), `.m` (MATLAB), `.s` (Assembly) e `.db` (SQLite). O UDS usa o conteúdo para decidir; veja `ReadMe/deteccao.md`.

<!-- formatos:fim -->

## Roteiro de desenvolvimento
Cada etapa só avança quando a anterior funciona. `[x]` = pronta, `[ ]` = a fazer, ✚ = etapa acrescentada a partir das ideias (detalhes em [`ReadMe/ideias.md`](ReadMe/ideias.md)).

**FUNDAÇÃO**
- [x] 0.00 - Tela base
- [x] 0.10 - Selecionar pastas para editar
- [x] 0.20 - Abrir e salvar arquivos de texto
- [x] 0.30 - Abas
- [x] 0.40 - Configurações básicas
- [x] 0.50 - Testes automáticos básicos
- [x] 0.60 - Numeração de linhas e destaque de sintaxe
- [x] 0.70 - Visualizador de imagens
- [x] 0.80 - Visualizadores como módulos
- [x] 0.90 - Modo portátil e ZIP automático (GitHub Actions)
- [x] 1.00 - Primeira release oficial (Windows)
- [x] ✚ 1.05 - Tela de loading personalizada, no estilo da abertura do After Effects (feita na 1.4.1 como painel dentro da janela principal; a janela separada e sem bordas fica para depois do teste no Windows)
- [ ] ✚ 1.06 - Reduzir o aviso do Windows (assinatura de código gratuita para open source). Já feito: hash SHA-256 dos ZIPs, propriedades do .exe, a política de assinatura no README e o texto do pedido (veja `ReadMe/assinatura.md`). Falta: você enviar o pedido e, depois da aprovação, ligar a assinatura no GitHub Actions

**VISUALIZAR**
- [x] 1.10 - Temas claro e escuro, lidos de um theme.json
- [x] 1.20 - Identificação de arquivos pelo conteúdo
- [x] 1.30 - Áudio
- [x] 1.40 - Vídeo
- [x] ✚ 1.45 - Visualizar: item **Visualizar** no botão direito de qualquer arquivo ou pasta, que abre uma prévia flutuante (imagem, áudio, vídeo, texto, pastas) sem abrir aba. Feito na 1.4.2 (veja `ReadMe/visualizar.md`)
- [ ] ✚ 1.46 - Vídeo, complementos: capturar um quadro como PNG, legendas (.srt e .vtt) e duração de MP4 fragmentado
- [ ] 1.50 - Modelos 3D (com biblioteca pronta)
- [ ] 1.60 - Abrir como... e associações de arquivo
- [ ] ✚ 1.65 - Área "Tipos de Arquivos": criar e editar tipos (ex.: .gml GameMaker). Já pronto na 1.2.0: a caixa flutuante de Configurações e a lista de tipos
- [ ] ✚ 1.66 - Pacotes de ícones em pastas, lidos como temas (variações preto e branco automáticas)
- [ ] 1.70 - Markdown e PDF (✚ a parte do Markdown pode vir antes: leitura formatada como no GitHub, em modos Código, Visualização e Dividido, com prévia ao vivo)
- [ ] 1.80 - CSV e JSON em tabela
- [ ] 1.90 - ZIP aberto como pasta
- [ ] 2.00 - Tela dividida

**EDITAR**
- [ ] 2.10 - Busca e substituição
- [ ] 2.20 - Autocompletar
- [ ] 2.30 - Formatação automática
- [ ] 2.40 - Salvamento automático e recuperação de sessão
- [ ] 2.50 - Terminal integrado
- [ ] 2.60 - Execução de scripts
- [ ] ✚ 2.70 - Editor de áudio (cortar, recortar, remover trecho, salvar como cópia) e **Modo Áudio**
- [ ] ✚ 2.80 - Editor de vídeo (corte com FFmpeg, salvar como cópia) e **Modo Vídeo**
- [ ] 3.00 - Git (status, commit e histórico)
- [ ] 3.50 - Comparar arquivos lado a lado

**PROJETOS E PERSONALIZAÇÃO** (criar um doc na pasta de temas explicando como criar o seu próprio, e um tema de exemplo)
- [ ] 4.00 - Vários projetos e configurações por projeto
- [x] ✚ 4.02 - **Modos de trabalho**: Universal (o UDS de hoje), Texto, Áudio e Vídeo; cada um mostra só o painel e os botões da sua função. Feito na 1.4.2 para **Universal e Texto**; Áudio e Vídeo já aparecem como "em breve" e chegam com os editores (2.70 e 2.80)
- [x] ✚ 4.05 - **Página inicial** (depois do loading): projetos recentes e fixados, que voltam no modo em que foram usados, e a escolha do modo. Feita na 1.4.2 (veja `ReadMe/inicio-e-modos.md`)
- [ ] ✚ 4.10 - Abas e painéis redimensionáveis, com os tamanhos salvos
- [ ] 4.20 - Espaços de trabalho salvos
- [ ] ✚ 4.30 - Cor individual das pastas (botão direito), salva em XML
- [ ] 4.50 - Importar temas em ZIP (com validação e recarga na hora)
- [ ] 4.70 - Atalhos e menus personalizáveis
- [ ] 5.00 - Layouts com arrastar e soltar

**PLUGINS**
- [ ] 6.00 - Sistema de plugins, API e plugin de exemplo (criar um doc dentro da pasta plugins explicando como criar e como funciona)
- [ ] 6.50 - Plugins de visualizador, editor e linguagem
- [ ] 6.70 - Temas com ícones e fontes próprias
- [ ] 7.00 - Gerenciador de extensões
- [ ] 7.50 - Permissões simples de plugins

**MANUTENÇÃO**
- [ ] 8.00 - Atualizador e cópias de segurança
- [ ] 8.50 - Importar e exportar ambientes
- [ ] 9.00 - Pacote para Linux (compilado pelo GitHub)
- [ ] 9.50 - Idiomas da interface e acessibilidade básica
- [ ] 10.00 - Versão estável com guia de plugins e de temas

Contribuições: veja `CONTRIBUTING.md`. Licença: MIT.
