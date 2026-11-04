# Atualizações do UDS

Cada versão lista o que mudou. A versão mais nova fica no topo. Os números de etapa (0.10, 1.20...) são os do roteiro no `README.md`.

## 1.0.1 — Novembro de 2026 — Ícones de arquivo
**Novo**
- Sistema de ícones de arquivo: **145 ícones em 2 estilos**, cada um em preto e branco (580 imagens).
- **Estilo 1** (folha com dobra) é o padrão. O **Estilo 2** (bloco arredondado) pode ser escolhido em *Configurações → Estilo dos ícones*.
- A cor do ícone acompanha o tema: branco no tema escuro, preto no tema claro.
- Ícone "vazio" para extensões sem ícone próprio.
- Todas as extensões do documento de formatos (mais de 200) já têm ícone.
- Pasta `ReadMe/` com os guias do projeto: `icones.md`, `estrutura.md`, `design.md` e este arquivo.
- `README.md` reescrito, com a explicação de cada comando e atalho.

**Melhorado**
- Ícones do explorador e das abas maiores, para a sigla ficar legível.
- Trocar o tema atualiza na hora os ícones.
- Testes automáticos novos: conferem que cada ícone existe nos 2 estilos e nas 2 cores, que nenhum ficou sem uso e que todas as extensões do documento têm ícone (15 testes no total).

**Removido**
- Ícones coloridos antigos (siglas desenhadas em código). O `CHANGELOG.md` e a pasta `docs/` foram substituídos por esta pasta `ReadMe/`.

## 1.0.0 — Novembro de 2026 — Fundação (etapas 0.00 a 0.90)
- **0.00** Tela base no estilo da imagem de referência, com bloco de notas por projeto no lugar do painel de IA.
- **0.10** Abrir pasta, explorador de arquivos, criar, renomear e excluir arquivos e pastas.
- **0.20** Abrir e salvar arquivos de texto (Ctrl+S).
- **0.30** Abas, com marca de arquivo alterado.
- **0.40** Configurações básicas: tema claro/escuro, tamanho da fonte e zoom (Ctrl +, Ctrl −, Ctrl 0).
- **0.50** Testes automáticos em JavaScript e em Rust.
- **0.60** Numeração de linhas e destaque de sintaxe.
- **0.70** Visualizador de imagens (zoom, rotação, ajuste e fundo xadrez para transparência).
- **0.80** Visualizadores como módulos (`src/visualizadores/`).
- **0.90** Modo portátil (`portable/`) e ZIP automático pelo GitHub Actions.
- **1.00** Primeira release oficial para Windows: pendente até a publicação da tag.

## Como registrar uma nova versão
1. Aumente o número em `package.json`, `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json` e na constante `VERSION` de `src/app.js`.
2. Acrescente aqui, no topo, uma seção com a data e as mudanças (Novo, Melhorado, Corrigido, Removido).
3. Marque no roteiro do `README.md` as etapas concluídas.
4. Publique a tag (`git tag vX.Y.Z` e `git push origin vX.Y.Z`).
