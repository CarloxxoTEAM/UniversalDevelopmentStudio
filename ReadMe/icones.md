# Ícones de arquivo do UDS

O UDS mostra um ícone diferente para cada tipo de arquivo no explorador, nas abas e nas telas de aviso. São **145 ícones**, desenhados em **dois estilos**, cada um em **preto e branco**.

## Os dois estilos

| | Estilo 1 (padrão) | Estilo 2 |
|---|---|---|
| Desenho | Folha de papel com dobra no canto e a sigla do formato | Retângulo arredondado preenchido com a sigla |
| Pasta | `src/icones/estilo1/` | `src/icones/estilo2/` |

O **Estilo 1 é o padrão**. Para trocar para o Estilo 2: **ícone de engrenagem (Configurações) → Estilo dos ícones**. A escolha é salva em `portable/config/settings.json` e continua na próxima vez que abrir o programa. O botão **Restaurar padrões** volta ao Estilo 1.

## Preto e branco: qual aparece quando

A cor muda sozinha com o tema, para o ícone sempre contrastar com o fundo:

| Tema | Versão usada |
|---|---|
| Escuro | `branco` |
| Claro | `preto` |

Trocar o tema (menu do logo → *Alternar tema claro/escuro*, ou em Configurações) atualiza todos os ícones na hora.

## Extensão sem ícone

Se a extensão não tiver ícone no índice, o UDS usa o ícone **vazio** do estilo escolhido (`src/icones/vazio/`): uma folha em branco no Estilo 1 e um bloco liso no Estilo 2. Exemplos de hoje: `.csv`, `Makefile`, arquivos sem extensão.

## Como as pastas são organizadas

```
src/icones/
├── indice.js                     <- liga cada extensão ao seu ícone
├── vazio/                        <- ícones de "arquivo desconhecido" (SVG)
├── estilo1/
│   ├── 01_marcacao_configuracao/
│   │   ├── branco/css.png
│   │   └── preto/css.png
│   ├── 02_programacao_scripts/ ...
│   └── ... (11 categorias)
└── estilo2/                      <- mesma organização do estilo1
```

Cada PNG tem **100 × 100 px** com fundo transparente. O nome do arquivo é o nome do ícone (`js.png`, `mp3.png`...). O mesmo nome existe nos dois estilos e nas duas cores; o teste automático (`npm test`) confere isso.

## Como o UDS escolhe o ícone

1. Pega a extensão do arquivo, em minúsculas (`Foto.JPEG` vira `jpeg`; `.tar.gz` é tratado como um todo).
2. Procura a extensão no `map` de `src/icones/indice.js`. Várias extensões podem usar o mesmo ícone (`.jpg` e `.jpeg` usam `jpg.png`; `.yml` e `.yaml` usam `yaml.png`).
3. Monta o caminho com o estilo e a cor atuais, por exemplo `icones/estilo1/05_imagens/branco/jpg.png`.
4. Se não achar, usa o ícone vazio.

## Como adicionar ou trocar um ícone

**Trocar o desenho de um ícone que já existe:** substitua os quatro arquivos com o mesmo nome (estilo 1 e 2, preto e branco) mantendo 100 × 100 px.

**Dar um ícone existente a uma extensão nova** (por exemplo, `.mjs2` usando o ícone do JavaScript): acrescente em `src/icones/indice.js`, dentro de `map`, a linha

```js
"mjs2":["02_programacao_scripts","js"]
```

**Criar um formato totalmente novo:** crie os quatro PNGs (`estilo1` e `estilo2`, `preto` e `branco`, dentro da categoria certa) e depois registre a extensão no `map` como acima. Rode `npm test`: ele avisa se faltar algum arquivo ou se sobrar um ícone sem uso.

Como os ícones entram dentro do programa na hora de compilar, uma mudança só aparece numa nova versão (veja `atualizacoes.md`). Carregar ícones de uma pasta externa, sem recompilar, está previsto junto com os temas e plugins (etapas 6.70 e 7.00 do roteiro).

## Material de origem para quem desenha

Em `assets-design/icones-base/` ficam os modelos vazios em SVG (100 × 100), as regras de desenho (`leia-me.txt`) e a fonte usada nas siglas:

- **Estilo 1:** contorno de 6 px com dobra; texto centralizado perto de y = 64, em DejaVu Sans Bold (até 30 px); o contorno atrás do texto é apagado com margem de 4 px.
- **Estilo 2:** retângulo arredondado (x 4, y 16, 92 × 68, raio 10); texto centralizado em DejaVu Sans Bold (até 36 px).
- **Fonte:** DejaVu Sans Bold, e DejaVu Sans Condensed Bold para rótulos longos. A licença está em `assets-design/icones-base/fonte/licenca-dejavu.txt` e deve acompanhar a fonte se ela for redistribuída.

## Lista completa dos ícones

### 01 · Marcação, configuração e estilização

| Ícone (arquivo) | Extensões que usam este ícone |
|---|---|
| `css.png` | .css |
| `html.png` | .htm, .html |
| `ini.png` | .ini |
| `json.png` | .json |
| `less.png` | .less |
| `md.png` | .markdown, .md |
| `scss.png` | .sass, .scss |
| `sgml.png` | .sgml |
| `svg.png` | .svg |
| `tex.png` | .tex |
| `toml.png` | .toml |
| `xhtml.png` | .xhtml |
| `xml.png` | .xml |
| `yaml.png` | .yaml, .yml |

### 02 · Linguagens de programação, scripts e runtime

| Ícone (arquivo) | Extensões que usam este ícone |
|---|---|
| `asm.png` | .asm, .s |
| `bat.png` | .bat, .cmd |
| `c.png` | .c, .h |
| `clj.png` | .clj |
| `cpp.png` | .cc, .cpp, .cxx, .hpp |
| `cs.png` | .cs |
| `dart.png` | .dart |
| `erl.png` | .erl |
| `ex.png` | .ex, .exs |
| `go.png` | .go |
| `graphql.png` | .gql, .graphql |
| `hs.png` | .hs |
| `java.png` | .class, .jar, .java |
| `js.png` | .cjs, .js, .mjs |
| `jsx.png` | .jsx |
| `kt.png` | .kt, .kts |
| `lua.png` | .lua |
| `matlab.png` | .m |
| `php.png` | .php, .phtml |
| `pl.png` | .pl |
| `ps1.png` | .ps1 |
| `py.png` | .ipynb, .py, .pyc, .pyw |
| `r.png` | .r |
| `rb.png` | .rb |
| `rs.png` | .rs |
| `scala.png` | .scala |
| `sh.png` | .bash, .sh, .zsh |
| `sql.png` | .sql |
| `swift.png` | .swift |
| `ts.png` | .ts, .tsx |
| `wasm.png` | .wasm |

### 03 · Áudio

| Ícone (arquivo) | Extensões que usam este ícone |
|---|---|
| `aac.png` | .aac |
| `aiff.png` | .aif, .aiff |
| `alac.png` | .alac |
| `amr.png` | .amr |
| `flac.png` | .flac |
| `m4a.png` | .m4a |
| `midi.png` | .mid, .midi |
| `mp3.png` | .mp3 |
| `ogg.png` | .oga, .ogg |
| `opus.png` | .opus |
| `pcm.png` | .pcm |
| `wav.png` | .wav |
| `wma.png` | .wma |

### 04 · Vídeo e animação

| Ícone (arquivo) | Extensões que usam este ícone |
|---|---|
| `3gp.png` | .3gp |
| `avi.png` | .avi |
| `flv.png` | .f4v, .flv |
| `lottie.png` | .lottie |
| `m2ts.png` | .m2ts |
| `mkv.png` | .mkv |
| `mov.png` | .mov |
| `mp4.png` | .m4v, .mp4 |
| `mpeg.png` | .mpeg, .mpg |
| `ogv.png` | .ogv |
| `vob.png` | .vob |
| `webm.png` | .webm |
| `wmv.png` | .wmv |

### 05 · Imagens vetoriais e bitmap

| Ícone (arquivo) | Extensões que usam este ícone |
|---|---|
| `ai.png` | .ai |
| `avif.png` | .avif |
| `bmp.png` | .bmp |
| `eps.png` | .eps |
| `gif.png` | .gif |
| `heic.png` | .heic, .heif |
| `ico.png` | .ico |
| `indd.png` | .indd |
| `jpg.png` | .jpeg, .jpg |
| `png.png` | .png |
| `psd.png` | .psb, .psd |
| `raw.png` | .arw, .cr2, .cr3, .dng, .nef, .raw |
| `tiff.png` | .tif, .tiff |
| `webp.png` | .webp |

### 06 · Modelos 3D, CAD e animação 3D

| Ícone (arquivo) | Extensões que usam este ícone |
|---|---|
| `3ds.png` | .3ds |
| `blend.png` | .blend |
| `c4d.png` | .c4d |
| `dae.png` | .dae |
| `dwg.png` | .dwg |
| `dxf.png` | .dxf |
| `fbx.png` | .fbx |
| `gltf.png` | .glb, .gltf |
| `iges.png` | .iges, .igs |
| `ma.png` | .ma, .mb |
| `max.png` | .max |
| `obj.png` | .mtl, .obj |
| `ply.png` | .ply |
| `step.png` | .step, .stp |
| `stl.png` | .stl |
| `usd.png` | .usd, .usda, .usdc, .usdz |
| `vrml.png` | .wrl, .x3d |

### 07 · Banco de dados

| Ícone (arquivo) | Extensões que usam este ícone |
|---|---|
| `accdb.png` | .accdb, .mdb |
| `bson.png` | .bson |
| `mysql.png` | *(reservado, sem extensão própria)* |
| `parquet.png` | .parquet |
| `sqlite.png` | .db, .db3, .sqlite |

### 08 · Fontes tipográficas

| Ícone (arquivo) | Extensões que usam este ícone |
|---|---|
| `eot.png` | .eot |
| `otf.png` | .otf |
| `ttf.png` | .ttf |
| `woff.png` | .woff |
| `woff2.png` | .woff2 |

### 09 · Documentos e leitura

| Ícone (arquivo) | Extensões que usam este ícone |
|---|---|
| `doc.png` | .doc, .docx |
| `epub.png` | .epub |
| `mobi.png` | .azw3, .mobi |
| `odp.png` | .odp |
| `ods.png` | .ods |
| `odt.png` | .odt |
| `pdf.png` | .pdf |
| `ppt.png` | .ppt, .pptx |
| `rtf.png` | .rtf |
| `txt.png` | .txt |
| `xls.png` | .xls, .xlsx |

### 10 · Compactados e imagens de disco

| Ícone (arquivo) | Extensões que usam este ícone |
|---|---|
| `7z.png` | .7z |
| `bz2.png` | .bz2 |
| `gz.png` | .gz |
| `img.png` | .img |
| `iso.png` | .iso |
| `rar.png` | .rar |
| `tar.png` | .tar |
| `tgz.png` | .tar.gz, .tgz |
| `zip.png` | .zip |

### 11 · Executáveis, pacotes e arquivos compilados

| Ícone (arquivo) | Extensões que usam este ícone |
|---|---|
| `aab.png` | .aab |
| `apk.png` | .apk, .xapk |
| `appimage.png` | .appimage |
| `bin.png` | .bin |
| `deb.png` | .deb |
| `dll.png` | .dll |
| `dmg.png` | .dmg |
| `dylib.png` | .dylib |
| `exe.png` | .exe |
| `msi.png` | .msi |
| `pkg.png` | .pkg |
| `rpm.png` | .rpm |
| `so.png` | .so |

Os ícones marcados como *reservados* já existem, mas não têm extensão própria. Serão usados quando o UDS passar a identificar arquivos pelo conteúdo (etapa 1.20 do roteiro).
