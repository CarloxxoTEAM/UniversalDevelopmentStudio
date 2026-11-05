# Atualizações do UDS

Cada versão lista o que mudou. A versão mais nova fica no topo. Os números de etapa (0.10, 1.20...) são os do roteiro no `README.md`.

## 1.1.0 — Novembro de 2026 — Temas (etapa 1.10)
**Novo**
- **Temas lidos de arquivos `theme.json`**: cada tema é uma pasta dentro de `themes/`, ao lado do executável. Vêm 3: `UDS Escuro`, `UDS Claro` e `Exemplo Oceano`.
- Lista de temas em *Configurações*, com os botões **Recarregar** e **Abrir pasta**. Também em *Exibir → Recarregar temas* e *Abrir pasta de temas*.
- **Recarga na hora**: ao salvar (Ctrl+S) um `theme.json` aberto no próprio UDS, as cores mudam sem reiniciar.
- **Validação**: um tema com erro é ignorado e o motivo aparece na aba Output. Cores que faltam vêm do tema padrão do mesmo tipo. Os temas `UDS Escuro` e `UDS Claro` existem mesmo se a pasta `themes/` for apagada.
- O tipo do tema (`escuro` ou `claro`) define a cor dos ícones: branco no escuro, preto no claro.
- Guia `themes/COMO-CRIAR-UM-TEMA.md` com os campos, a tabela de cores e as mensagens de erro.
- O tema escolhido é salvo em `portable/config/settings.json`.
- `scripts/package.py` agora gera um arquivo `.sha256` com o hash de cada ZIP (parte da etapa 1.06) e inclui a pasta `themes/` no pacote.
- Nome do programa, versão e direitos autorais nas propriedades do `.exe`.

**Melhorado**
- 27 testes automáticos (novos: validação de temas, cores inválidas, `id` igual ao nome da pasta, todos os temas do projeto e consistência entre o CSS e os temas embutidos).

**Robô de build (`.github/workflows/build.yml`)**
- Roda `npm test` antes de compilar.
- Os arquivos `.sha256` vão junto dos ZIPs nas releases.
- Sem o macOS, que falhava por falta de máquina no GitHub (volta na etapa de pacotes para outros sistemas).

## 1.0.2 — Novembro de 2026 — Ícones de pasta e GameMaker
**Novo**
- **Ícones de pasta**, fechada e aberta, nos 2 estilos e em preto e branco. No explorador, as pastas são brancas no tema escuro e pretas no claro, e mudam para "aberta" ao expandir.
- Ícone do **GameMaker** (`.gml`) nos 2 estilos e nas 2 cores, como exemplo de tipo criado depois da lista original.
- `scripts/gerar_icone.py`: gera os 4 ícones de um tipo novo no mesmo traço dos existentes (`python scripts/gerar_icone.py GML gml 12_extras`) e refaz as pastas (`--pastas`).
- Documentos novos: `ReadMe/ideias.md` (ideias organizadas por versão) e `ReadMe/icones-personalizados.md` (como um tipo de arquivo ganha ícone para sempre, pacotes de ícones e a área "Tipos de Arquivos").
- Roteiro com 7 etapas novas, marcadas com ✚: 1.05, 1.06, 1.65, 1.66, 4.05, 4.10 e 4.30.

**Melhorado**
- 17 testes automáticos (novos: ícones de pasta nos 2 estilos e nas 2 cores, e o ícone do GameMaker).

**Removido**
- Os ícones de pasta coloridos em código (substituídos pelos PNGs).

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
- **1.00** Primeira release oficial para Windows, publicada.

## Como registrar uma nova versão
1. Aumente o número em `package.json`, `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json` e na constante `VERSION` de `src/app.js`.
2. Acrescente aqui, no topo, uma seção com a data e as mudanças (Novo, Melhorado, Corrigido, Removido).
3. Marque no roteiro do `README.md` as etapas concluídas.
4. Publique a tag (`git tag vX.Y.Z` e `git push origin vX.Y.Z`).
