# Universal Development Studio (UDS)

*One Studio. Unlimited Possibilities.*

O UDS é um ambiente **universal e portátil** para desenvolvimento, edição e visualização de arquivos. Em uma única janela, você abre uma pasta, edita código e vê imagens (e, nas próximas versões, áudio, vídeo, modelos 3D, PDF e mais). Ele roda direto de uma pasta ou pendrive, sem instalação, e guarda tudo ao lado do executável.

A interface segue o estilo dos editores modernos, com explorador de arquivos à esquerda, abas e editor no centro, painel inferior e, à direita, um **bloco de notas por projeto**.

**Versão atual:** 1.3.0 · **Plataforma:** Windows (Linux e macOS nas etapas 9.00 em diante) · **Licença:** MIT

## O que já funciona
- Abrir uma pasta do computador e navegar pelos arquivos.
- Criar, renomear e excluir arquivos e pastas.
- Abas e editor de texto com numeração de linhas e destaque de sintaxe.
- Visualizador de imagens (PNG, JPG, GIF, WEBP, BMP, ICO, SVG) com zoom, rotação e ajuste.
- **Player de áudio** (MP3, WAV, FLAC, OGG, Opus, AAC, M4A) com capa, etiquetas, forma de onda clicável, velocidade e dados técnicos (veja `ReadMe/audio.md`).
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

## Comandos do programa
Tudo isso está no menu que abre ao clicar no **logo do UDS** (canto superior esquerdo).

| Comando | O que faz | Atalho |
|---|---|---|
| Abrir pasta… | Escolhe a pasta do projeto; ela aparece no explorador | `Ctrl+O` |
| Abrir arquivo… | Abre um arquivo avulso em uma aba | |
| Novo arquivo | Cria um arquivo vazio na pasta do projeto e o abre | |
| Nova pasta | Cria uma pasta no projeto | |
| Salvar | Salva todos os arquivos alterados (marcados com ●) | `Ctrl+S` |
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
| `git tag v1.3.0` e `git push origin v1.3.0` | Publica uma versão: o GitHub Actions compila, testa, gera o ZIP e o coloca em **Releases** |

## Guias
**Como criar um tema:** [`themes/COMO-CRIAR-UM-TEMA.md`](themes/COMO-CRIAR-UM-TEMA.md)

**Na pasta `ReadMe/`:**
| Arquivo | Conteúdo |
|---|---|
| [`ReadMe/icones.md`](ReadMe/icones.md) | Os 2 estilos de ícone, preto e branco por tema, como adicionar ou trocar ícones e a lista completa por extensão |
| [`ReadMe/audio.md`](ReadMe/audio.md) | O player de áudio: controles, formatos, etiquetas lidas, limites e testes |
| [`ReadMe/deteccao.md`](ReadMe/deteccao.md) | Como o UDS descobre o tipo de um arquivo pelo conteúdo, formatos reconhecidos e limites |
| [`ReadMe/icones-personalizados.md`](ReadMe/icones-personalizados.md) | Como um tipo de arquivo ganha ícone para sempre, pacotes de ícones e a área "Tipos de Arquivos" |
| [`ReadMe/ideias.md`](ReadMe/ideias.md) | Ideias e melhorias organizadas por versão |
| [`ReadMe/atualizacoes.md`](ReadMe/atualizacoes.md) | O que mudou em cada versão |
| [`ReadMe/estrutura.md`](ReadMe/estrutura.md) | Pastas, arquitetura, portabilidade e como criar um visualizador |
| [`ReadMe/design.md`](ReadMe/design.md) | Logo, paleta de cores e capturas do design |

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
- [ ] ✚ 1.05 - Tela de loading personalizada, no estilo da abertura do After Effects
- [ ] ✚ 1.06 - Reduzir o aviso do Windows (assinatura de código gratuita para open source). Já feito: hash SHA-256 dos ZIPs e propriedades do .exe. Falta: o pedido de assinatura

**VISUALIZAR**
- [x] 1.10 - Temas claro e escuro, lidos de um theme.json
- [x] 1.20 - Identificação de arquivos pelo conteúdo
- [x] 1.30 - Áudio
- [ ] 1.40 - Vídeo
- [ ] 1.50 - Modelos 3D (com biblioteca pronta)
- [ ] 1.60 - Abrir como... e associações de arquivo
- [ ] ✚ 1.65 - Área "Tipos de Arquivos": criar e editar tipos (ex.: .gml GameMaker). Já pronto na 1.2.0: a caixa flutuante de Configurações e a lista de tipos
- [ ] ✚ 1.66 - Pacotes de ícones em pastas, lidos como temas (variações preto e branco automáticas)
- [ ] 1.70 - Markdown e PDF
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
- [ ] 3.00 - Git (status, commit e histórico)
- [ ] 3.50 - Comparar arquivos lado a lado

**PROJETOS E PERSONALIZAÇÃO** (criar um doc na pasta de temas explicando como criar o seu próprio, e um tema de exemplo)
- [ ] 4.00 - Vários projetos e configurações por projeto
- [ ] ✚ 4.05 - Tela de projetos com atalhos para projetos e pastas recentes
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
