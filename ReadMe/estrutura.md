# Estrutura e arquitetura

## Pastas do projeto
| Caminho | Função |
|---|---|
| `src-tauri/` | Núcleo em Rust: lê e grava arquivos, guarda configurações em `portable/`. |
| `src-tauri/tauri.conf.json` | Janela, segurança e nome do executável. `bundle.active = false` gera só o executável, sem instalador. |
| `src-tauri/capabilities/` | Permissões da interface (diálogo de escolher pastas). |
| `src/` | Interface (HTML, CSS e JavaScript). Tudo aqui é embutido no executável ao compilar. |
| `src/core.js` | Funções puras (extensão, destaque de sintaxe, caminho do ícone). São as testadas em `tests/`. |
| `src/app.js` | Telas e comportamento: menus, explorador, abas, editor, notas, configurações. |
| `src/visualizadores/` | Um módulo por visualizador (`imagem.js`) e o registro (`registro.js`). |
| `src/icones/` | Ícones de arquivo e o índice (veja `icones.md`). |
| `tests/` | Testes automáticos de JavaScript. |
| `scripts/package.py` | Monta a pasta portátil e o ZIP. |
| `scripts/gerar_icone.py` | Gera os ícones de um tipo de arquivo novo e os ícones de pasta. |
| `.github/workflows/build.yml` | Compila, testa, empacota e publica em Releases ao criar uma tag `vX.Y.Z`. |
| `assets-design/` | Logo, capturas do design e o material de origem dos ícones. |
| `ReadMe/` | Estes guias. |
| `portable/` | Criada ao lado do executável: configurações, notas e dados do WebView. |

## Como a interface fala com o núcleo
A interface chama o núcleo com `invoke("nome_do_comando", {...})`. Cada comando é uma função Rust marcada com `#[tauri::command]` em `src-tauri/src/main.rs`: `list_dir`, `read_file`, `write_file`, `create_dir`, `rename_path`, `delete_path`, `load_config`, `save_config` e `portable_path`.

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
- `npm test` roda `tests/core.test.js` (funções puras e conferência dos ícones).
- `cargo test --manifest-path src-tauri/Cargo.toml` roda os testes do núcleo Rust.
