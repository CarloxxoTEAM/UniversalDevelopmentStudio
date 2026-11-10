# Visualizador de vídeo

Abra qualquer arquivo de vídeo no explorador e ele toca na mesma janela, com controles e uma tabela de dados técnicos. Como o de áudio (`audio.md`), usa a identificação pelo conteúdo (`deteccao.md`): um MP4 sem extensão, ou um MKV com a extensão errada, também abre aqui.

## O que aparece
- **Tela do vídeo:** clique para tocar ou pausar; duplo clique para tela cheia.
- **Controles:** tocar/pausar, posição, **quadro anterior e próximo**, volume, mudo, velocidade (0,25× a 2×), repetir e tela cheia.
- **Dados técnicos**, em três blocos:
  - *Arquivo:* formato, contêiner, duração, tamanho, taxa de bits total, título e data de criação.
  - *Vídeo:* codec com perfil e nível (ex.: *H.264 · High · nível 4.0*), resolução, taxa de quadros, taxa de bits e rotação (vídeos de celular gravados "em pé").
  - *Áudio:* codec, taxa de amostragem, canais e taxa de bits.
  Só aparece o que o arquivo informa.

## Teclado
Com o player em foco (clique nele uma vez):

| Tecla | O que faz |
|---|---|
| `Espaço` | Tocar ou pausar |
| `←` / `→` | Voltar ou avançar 5 segundos (com `Shift`, 10 segundos) |
| `,` / `.` | Quadro anterior / próximo quadro (pausa o vídeo) |
| `↑` / `↓` | Volume + ou − 5% |
| `M` | Silenciar |
| `L` | Repetir |
| `F` | Tela cheia (`Esc` sai) |

## Formatos
**Tocam** (dependem dos codecs do sistema): MP4, MOV, 3GP, MKV e WebM. O que decide é o codec de dentro do arquivo:

| Codec | No Windows (WebView2) |
|---|---|
| H.264 + AAC (o mais comum) | Toca. **Ainda a confirmar no seu Windows.** |
| VP8 / VP9 / AV1 + Opus / Vorbis (WebM) | Toca. WebM foi testado tocando de verdade, em Chromium. |
| H.265 (HEVC) | Só se o Windows tiver a extensão de vídeo HEVC |
| ProRes, DV, MPEG-4 Parte 2, WMV | Normalmente não |

**Só mostram informações** quando o sistema não toca: AVI, WMV, FLV, MPEG/MPG, VOB e M2TS/TS. O player avisa e a tabela continua na tela. **OGV (Theora):** o Chromium recente já não decodifica Theora, então só o áudio toca e o player avisa "Sem imagem". Um conversor de formatos está previsto no roteiro de plugins.

**Dados técnicos lidos pelo UDS:**

| Formato | O que é lido |
|---|---|
| MP4 / M4V / MOV / 3GP | Duração, codecs, perfil e nível (H.264 e HEVC), resolução, fps, taxa de bits de cada faixa, rotação, título, data de criação. Funciona com o `moov` no fim do arquivo e com MP4 fragmentado (sem duração, fps nem taxa de bits) |
| WebM / MKV | Duração, título, codecs, perfil e nível (H.264), resolução, fps, áudio (taxa e canais) |
| AVI | Duração, codecs (pelo FourCC e pela tag de áudio), resolução, fps, taxa de bits do áudio |
| FLV | Os metadados `onMetaData`: duração, codecs, resolução, fps, taxas |
| OGV | Theora (resolução, fps, duração) e Vorbis (canais e taxa) |
| MPEG, VOB, TS/M2TS, WMV | Nada além do formato e do tamanho (a duração vem do player, se ele tocar) |

## Limites
- **Arquivos grandes não são carregados na memória.** O UDS lê só trechos (o cabeçalho e o `moov`), com pedidos `Range`. Se o sistema ignorar o `Range`, ele lê o começo em fluxo e para; se a informação estiver depois de 64 MB (MP4 com `moov` no fim, sem `Range`), a tabela mostra "Leitura parcial" e o vídeo toca normalmente.
- **MP4 fragmentado** (gravações em *streaming*): a duração mostrada vem do player; fps e taxa de bits ficam em branco.
- WebM/MKV: o UDS lê o início do arquivo (até 4 MB). Arquivos que guardam as informações depois disso (raros) mostram só o que o player informar.
- O passo por quadro usa o fps do arquivo (30 se ele não informar); em vídeo de fps variável é uma aproximação.
- Legendas, miniaturas e captura de quadro não existem ainda (etapa 1.45 do roteiro).
- Ao trocar o tema ou o zoom com um vídeo tocando, ele **continua** do mesmo ponto, com a mesma velocidade e volume. Trocar de aba **para** o vídeo.

## Como funciona por dentro
1. O núcleo em Rust libera o arquivo para a interface pelo protocolo `asset` do Tauri, com suporte a trechos. Por isso o `<video>` toca e avança sem carregar tudo.
2. `src/videometa.js` lê os dados técnicos por um "leitor" `(posição, tamanho) => bytes`. É um módulo puro, sem tela: nos testes o leitor lê arquivos de verdade; no programa, faz `fetch` com `Range`.
3. `src/visualizadores/video.js` desenha o player e a tabela, e guarda a posição, o volume e a velocidade ao trocar de tema.
4. O volume escolhido (`videoVol`) fica salvo em `portable/config/settings.json`, separado do volume do áudio.

## Testes
- `npm test` roda `tests/video.test.js`, que compara o leitor com o **ffprobe** (gabarito independente) em 21 vídeos reais gerados pelo ffmpeg: MP4 (com `moov` no fim e com *faststart*, sem áudio, HEVC, fragmentado, girado), MOV, ProRes, 3GP, WebM (VP8 e VP9), MKV (H.264 e AV1), AVI (MPEG-4 + MP3 e MJPEG + PCM), FLV, OGV, MPEG-2, M2TS, TS e WMV. Também testa um arquivo de 400 MB simulado (só pode ler o `moov`) e arquivos truncados e corrompidos. As amostras saem de `python tests/gerar_amostras_video.py` (precisa do ffmpeg e do ffprobe).
- `node tests/video.navegador.js` (opcional, precisa do Playwright com Chromium) abre cada formato no visualizador de verdade: confere a tabela com o ffprobe, toca WebM, usa os controles e o teclado, e confere os avisos para formatos que o Chromium não toca. **Não substitui** o teste no WebView2 do Windows.

## Como acrescentar um formato
1. Em `src/videometa.js`, escreva a função de leitura (recebe `leitor` e `tam`) e registre-a em `FORMATOS`, com o `id` que a detecção devolve.
2. Se o formato for novo para o UDS, registre a assinatura em `src/deteccao.js` (veja `deteccao.md`).
3. Acrescente uma amostra em `tests/gerar_amostras_video.py` e rode `npm test`.
