# Estrutura e arquitetura

## Pastas do projeto
| Caminho | Função |
|---|---|
| `src-tauri/` | Núcleo em Rust: lê e grava arquivos, guarda configurações em `portable/`. |
| `src-tauri/tauri.conf.json` | Janela, segurança e nome do executável. `bundle.active = false` gera só o executável, sem instalador. |
| `src-tauri/capabilities/` | Permissões da interface (diálogo de escolher pastas). |
| `src/` | Interface (HTML, CSS e JavaScript). Tudo aqui é embutido no executável ao compilar. |
| `src/core.js` | Funções puras (extensão, destaque de sintaxe, caminho do ícone). São as testadas em `tests/`. |
| `src/deteccao.js` | Identificação de arquivos pelo conteúdo (módulo puro, testado). |
| `src/audiometa.js` | Leitura de etiquetas e dados técnicos de áudio (módulo puro, testado com o ffprobe). |
| `src/videometa.js` | Leitura de dados técnicos de vídeo, por trechos do arquivo (módulo puro, testado com o ffprobe). |
| `src/app.js` | Telas e comportamento: menus, explorador, abas, editor, notas, configurações. |
| `src/visualizadores/` | Um módulo por visualizador (`imagem.js`, `audio.js`, `video.js`) e o registro (`registro.js`). |
| `src/icones/` | Ícones de arquivo e o índice (veja `icones.md`). |
| `tests/` | Testes automáticos de JavaScript. `tests/amostras/` guarda arquivos reais de amostra (gerados por `tests/gerar_amostras.py`); `tests/amostras/audio/` e `tests/amostras/video/` têm os de áudio e vídeo e o gabarito do ffprobe. |
| `scripts/package.py` | Monta a pasta portátil e o ZIP. |
| `scripts/gerar_icone.py` | Gera os ícones de um tipo de arquivo novo e os ícones de pasta. |
| `.github/workflows/build.yml` | Compila, testa, empacota e publica em Releases ao criar uma tag `vX.Y.Z`. |
| `themes/` | Temas (`theme.json`) e o guia para criar o seu. Fica ao lado do executável e vai no ZIP portátil. |
| `assets-design/` | Logo, capturas do design e o material de origem dos ícones. |
| `ReadMe/` | Estes guias. |
| `portable/` | Criada ao lado do executável: configurações, notas e dados do WebView. |

## Como a interface fala com o núcleo
A interface chama o núcleo com `invoke("nome_do_comando", {...})`. Cada comando é uma função Rust marcada com `#[tauri::command]` em `src-tauri/src/main.rs`: `list_dir`, `read_file` (devolve também os primeiros 512 bytes), `write_file`, `create_dir`, `rename_path`, `delete_path`, `load_config`, `save_config`, `portable_path` e `themes_path`.

## Portabilidade
O executável cria `portable/config/settings.json` ao lado dele. No Windows, o WebView2 também guarda seus dados em `portable/webview/`. Requisito: WebView2 Runtime (já vem no Windows 10 e 11 atualizados). Para levar o ambiente a outro computador, copie a pasta inteira.

## Visualizadores como módulos
`src/visualizadores/registro.js` guarda a lista de visualizadores. Cada módulo se registra:

```js
UDS.registerViewer({
  id: 'meu-formato', nome: 'Meu formato',
  match: (caminho, doc) => caminho.endsWith('.xyz'),
  open: (caminho, doc, container, ctx) => { container.textContent = 'Olá'; }
});
```
Depois inclua `<script src="visualizadores/meu-formato.js"></script>` no `src/index.html`. O núcleo não precisa mudar.

## Testes
- `npm test` roda `tests/core.test.js` (funções puras, ícones, temas) e `tests/deteccao.test.js` (identificação pelo conteúdo) e `tests/audio.test.js` (áudio) e `tests/video.test.js` (vídeo). `node tests/video.navegador.js` é um teste opcional em Chromium real (precisa do Playwright).
- `cargo test --manifest-path src-tauri/Cargo.toml` roda os testes do núcleo Rust.
