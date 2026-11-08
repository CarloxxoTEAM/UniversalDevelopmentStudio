# Identificação de arquivos pelo conteúdo

O UDS não depende só da extensão. Ao **abrir** um arquivo, ele lê os primeiros bytes (e, se for texto, o conteúdo) e descobre o que ele realmente é. Isso vale para arquivos sem extensão, com extensão desconhecida ou com a extensão errada.

## O que muda para você
- **Ícone:** o ícone da aba e do explorador passa a ser o do tipo real. Um PNG chamado `foto.txt` ganha o ícone de PNG.
- **Barra de status** (rodapé): mostra o tipo e como ele foi descoberto. Exemplos: `PNG · pelo conteúdo · ⚠ a extensão .txt não combina com o conteúdo (PNG)` e `Python · pelo conteúdo`.
- **Realce de sintaxe:** um script sem extensão que começa com `#!/usr/bin/env python3` abre com o realce de Python.
- **Áudio** já tem visualizador (1.30): um MP3 sem extensão abre no player. Veja `audio.md`.
- **Arquivos que o UDS ainda não sabe mostrar** (PDF, ZIP, fontes, executáveis...) deixam de abrir como texto ilegível: aparece uma tela com o formato identificado e a etapa em que o visualizador chega. O botão **Abrir como texto** continua disponível.
- **Arquivos binários** são reconhecidos pelos bytes nulos no início, mesmo que o resto pareça texto.

## Como o UDS decide
1. **Assinatura binária** (os primeiros bytes): vence a extensão. É confiável porque os formatos têm "números mágicos".
2. **Texto:** só é analisado quando a extensão não diz nada: sem extensão, desconhecida, `.txt`, `.json` ou `.sql`. Se o arquivo se chama `script.py`, ele é Python, mesmo que comece com outra coisa.
3. **Extensão:** é o último recurso e o único critério que o explorador usa para listar arquivos sem abri-los.

Quando a extensão combina com o conteúdo (por exemplo `.jpeg` com um JPEG, ou `.docx` com um arquivo ZIP de Office), não há aviso. Casos compatíveis conhecidos: `.json` com Lottie, `.sql` com dump do MySQL, `.apk`/`.jar` com ZIP, `.so` com ELF.

## Formatos reconhecidos pelo conteúdo
| Grupo | Formatos |
|---|---|
| Imagem | PNG, JPEG, GIF, WebP, BMP, ICO, TIFF, PSD, EPS, HEIC, AVIF, e RAW de câmeras (CR2, DNG, NEF, ARW, CR3), além de `.ai`, que é um PDF por dentro |
| Áudio | MP3, WAV, FLAC, AAC, OGG, Opus, M4A, MIDI, AMR, AIFF |
| Vídeo | MP4, MOV, 3GP, AVI, MKV, WebM, FLV, MPEG, MPEG-TS, WMV/WMA, OGV |
| Documento | PDF, EPUB, OpenDocument (ODT, ODS, ODP), Office em ZIP (DOCX, XLSX, PPTX), Office antigo (OLE) |
| Compactado | ZIP, RAR, 7z, GZip, BZip2, TAR |
| Fonte | TTF, OTF, WOFF, WOFF2, EOT |
| Banco de dados | SQLite, Parquet, Access |
| Executável | EXE e DLL (Windows), ELF (Linux), Mach-O (macOS), Java `.class`, DEB, RPM, PKG |
| 3D e CAD | GLB, FBX, Blender, DWG, e em texto: OBJ, STL, PLY, DXF |
| Código e texto | Scripts por `#!` (Python, Node, Shell, Perl, Ruby, PHP, Lua, R, PowerShell), PHP, HTML, XML, SVG, JSON, **Lottie**, SQL, **MySQL**, YAML, LaTeX |

Os ícones do **Lottie** e do **MySQL**, que antes ficavam reservados, agora são usados: um `.json` com camadas de animação é Lottie, e um `.sql` que começa com `-- MySQL dump` é MySQL.

## Limites
- A detecção acontece **ao abrir** o arquivo. O explorador só olha a extensão, porque ler todos os arquivos de uma pasta deixaria o programa lento.
- Alguns formatos não têm assinatura nos primeiros bytes e **não são detectados**: ISO, DMG, STL binário, 3DS, MAX, Maya, Cinema 4D, INDD e MOBI/AZW3. Para eles vale a extensão.
- Nomes especiais como `Makefile` e `Dockerfile` não têm ícone no conjunto atual.
- Um arquivo de texto em UTF-16 aparece como binário; use **Abrir como texto**.
- Um ZIP pode ser um DOCX, um JAR ou um EPUB: o UDS tenta distinguir pelo primeiro item do ZIP e pela extensão do arquivo.

## Como acrescentar um formato
1. Em `src/deteccao.js`, acrescente uma linha na lista `BIN` (para assinaturas de bytes) ou em `detectarTexto` (para texto). Cada linha devolve `D(id, nome, categoria, extensão, mime, opções)`.
2. Se o formato precisa de um ícone, veja `ReadMe/icones-personalizados.md`.
3. Em `tests/deteccao.test.js`, acrescente um caso. Arquivos reais de amostra são gerados por `python tests/gerar_amostras.py`.
4. Rode `npm test`. Há um teste que confere se textos comuns, como `OTTO was here`, não são confundidos com formatos binários.

## Como funciona por dentro
O núcleo em Rust (`read_file`) devolve o tipo básico (texto, imagem ou binário) e os **primeiros 512 bytes**. A decisão fica em `src/deteccao.js`, que é um módulo puro e testado sem a janela do programa.
