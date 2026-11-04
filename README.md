# Universal Development Studio (UDS)

Ambiente universal e portátil para desenvolvimento, edição e visualização de arquivos.
*One Studio. Unlimited Possibilities.*

Roda direto de uma pasta, sem instalação. Interface inspirada no VS Code, com um bloco de notas por projeto no lugar do painel de IA.

## Roteiro de desenvolvimento

Cada etapa só avança quando a anterior funciona. `[x]` = pronta, `[ ]` = a fazer.

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
- [ ] 1.00 - Primeira release oficial (Windows)

**VISUALIZAR**
- [ ] 1.10 - Temas claro e escuro, lidos de um theme.json
- [ ] 1.20 - Identificação de arquivos pelo conteúdo
- [ ] 1.30 - Áudio
- [ ] 1.40 - Vídeo
- [ ] 1.50 - Modelos 3D (com biblioteca pronta)
- [ ] 1.60 - Abrir como... e associações de arquivo
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
- [ ] 4.20 - Espaços de trabalho salvos
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

O que já existe na interface e funciona hoje: abrir pasta, explorador, criar/renomear/excluir, abas, editor com numeração e destaque de sintaxe, imagens, tema claro/escuro, tamanho da fonte, zoom (Ctrl +, Ctrl -, Ctrl 0), bloco de notas por projeto. Os ícones de Busca, Git, Execução e Extensões, e o painel Terminal, já aparecem na tela, mas só ganham função nas versões indicadas.

## Usar (portátil)
1. Em **Releases**, baixe o ZIP da sua plataforma.
2. Extraia em qualquer pasta ou pendrive.
3. Execute `UniversalDevelopmentStudio.exe`.

Configurações e notas ficam em `portable/`. Para atualizar, extraia a nova versão por cima, mantendo `portable/` e `projects/`.
Windows: precisa do WebView2 Runtime (já incluso no Windows 10/11 atualizados).

## Desenvolver
Requisitos: [Node.js 20+](https://nodejs.org), [Rust](https://rustup.rs) e os [pré-requisitos do Tauri](https://tauri.app/start/prerequisites/).

```
npm install
npm run icons    # gera os ícones a partir de app-icon.png
npm test         # testes da interface (JavaScript)
cargo test --manifest-path src-tauri/Cargo.toml   # testes do núcleo (Rust)
npm run dev      # abre o UDS em modo de desenvolvimento
npm run build    # gera o executável em src-tauri/target/release/
```

## Publicar uma versão
```
git tag v1.0.0
git push origin v1.0.0
```
O GitHub Actions compila, testa, gera o ZIP portátil e o publica em Releases.

## Estrutura
| Pasta | Função |
|---|---|
| `src-tauri/` | Núcleo em Rust (arquivos, configurações, portabilidade) |
| `src/` | Interface (`app.js`, `core.js` com funções puras e testadas) |
| `src/visualizadores/` | Um módulo por visualizador (`imagem.js`); veja `registro.js` |
| `tests/` | Testes automáticos |
| `assets-design/` | Logo e imagens do design |
| `portable/` | Configurações do usuário (criada ao lado do executável) |

Veja `docs/ARQUITETURA.md`, `CONTRIBUTING.md` e `CHANGELOG.md`. Licença: MIT.
