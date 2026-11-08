# Visualizador de áudio

Abra qualquer arquivo de áudio no explorador e ele toca na mesma janela, com capa, etiquetas, forma de onda e dados técnicos. É o primeiro visualizador que usa a identificação pelo conteúdo (`deteccao.md`): um MP3 sem extensão também abre aqui.

## O que aparece
- **Capa e título:** a capa do álbum (se o arquivo tiver), o título, o artista e o álbum, com ano, gênero e faixa logo abaixo. Sem etiqueta de título, aparece o nome do arquivo.
- **Forma de onda:** o desenho do som ao longo do tempo. A parte já tocada fica na cor de destaque do tema. **Clique na onda** para ir a qualquer ponto.
- **Controles:** tocar/pausar, posição, volume, mudo, velocidade (0,5× a 2×) e repetir.
- **Dados técnicos:** formato, codec, duração, taxa de amostragem, canais, profundidade de bits, taxa de bits, tamanho e tipo MIME.
- **Etiquetas:** título, artista, artista do álbum, álbum, ano, faixa, disco, gênero e comentário (só as que o arquivo tiver).

## Teclado
Com o player em foco (clique nele uma vez):

| Tecla | O que faz |
|---|---|
| `Espaço` | Tocar ou pausar |
| `←` / `→` | Voltar ou avançar 5 segundos |
| `↑` / `↓` | Volume + ou − 5% |
| `M` | Silenciar |

## Formatos
**Tocam** (dependem do sistema; no Windows, o WebView2 toca todos estes): MP3, WAV, FLAC, OGG (Vorbis), Opus, AAC e M4A.

**Só mostram informações** quando o sistema não consegue decodificar: WMA, AIFF, ALAC, AMR, MIDI e PCM. O player avisa e os dados do arquivo continuam na tela. Um conversor de formatos está previsto no roteiro de plugins.

**Etiquetas e dados técnicos lidos pelo UDS:**

| Formato | O que é lido |
|---|---|
| MP3 | ID3v2.2, 2.3 e 2.4 (inclusive UTF-8 e UTF-16, e capa), ID3v1, versão e camada MPEG, taxa de bits, VBR (Xing) |
| FLAC | Dados do STREAMINFO, comentários Vorbis e imagem de capa |
| OGG Vorbis e Opus | Cabeçalhos, comentários e duração |
| M4A (AAC e ALAC) | Etiquetas do iTunes, capa, codec, canais e taxa |
| WAV | Formato, bits, taxa, etiquetas `LIST INFO` e `id3` |

## Limites
- **Arquivos acima de 40 MB:** tocam normalmente, mas a forma de onda e as etiquetas ficam desativadas, porque o UDS precisaria ler o arquivo inteiro na memória. A mensagem aparece no player.
- **A forma de onda é um resumo:** o UDS decodifica o áudio em 8 kHz para gastar pouca memória. Serve para ver a estrutura da música, não para edição.
- Trocar de aba **para** o som. Um mini player que continue tocando em segundo plano não está no roteiro atual.
- Etiquetas APE e ID3v2 com criptografia ou compressão não são lidas.
- Ao trocar o tema ou o zoom com uma música tocando, ela **continua** do mesmo ponto, com a mesma velocidade e volume.

## Como funciona por dentro
1. O núcleo em Rust libera o arquivo para a interface pelo protocolo de arquivos do Tauri (`asset`), com suporte a trechos. Por isso o `<audio>` toca e avança sem carregar tudo.
2. `src/audiometa.js` lê as etiquetas e os dados técnicos dos bytes do arquivo. É um módulo puro, sem tela.
3. A forma de onda usa `decodeAudioData` do próprio navegador e guarda só os **picos** (1.200 colunas), não o áudio.
4. O volume escolhido fica salvo em `portable/config/settings.json`.

## Testes
`npm test` roda `tests/audio.test.js`, que compara o leitor com o **ffprobe** (gabarito independente) em 9 arquivos reais: MP3 (ID3v2.3, ID3v2.4 e ID3v1), FLAC, OGG, Opus, M4A e WAV de 16 e 24 bits. Também testa arquivos truncados e corrompidos. Os arquivos são gerados por `python tests/gerar_amostras_audio.py` (precisa de `ffmpeg`, `ffprobe` e `pillow`).

## Como acrescentar um formato
1. Em `src/audiometa.js`, escreva a função de leitura e chame-a em `lerMetadados`.
2. Se o formato for novo para o UDS, registre a assinatura em `src/deteccao.js` (veja `deteccao.md`).
3. Acrescente um arquivo de amostra em `tests/gerar_amostras_audio.py` e um caso em `tests/audio.test.js`.
