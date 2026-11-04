# Arquitetura (Fundação)

| Arquivo | Responsabilidade |
|---|---|
| `src-tauri/src/main.rs` | Núcleo em Rust: lê/grava arquivos, identifica formatos pelo conteúdo, executa comandos, guarda configurações em `portable/`. |
| `src-tauri/tauri.conf.json` | Janela, segurança e nome do executável. `bundle.active=false` gera só o executável, sem instalador. |
| `src-tauri/capabilities/` | Permissões que a interface recebe (diálogo de pastas). |
| `src/index.html`, `styles.css`, `app.js` | Interface: menus, explorador, abas, editor, visualizadores, terminal. |
| `scripts/package.py` | Monta a pasta portátil e o ZIP. |
| `.github/workflows/build.yml` | Compila para Windows, Linux e macOS e publica em Releases ao criar uma tag `vX.Y.Z`. |

A interface chama o núcleo com `invoke("nome_do_comando", {...})`. Cada comando é uma função Rust marcada com `#[tauri::command]`.

## Portabilidade
O executável cria `portable/config/settings.json` ao lado dele. No Windows, o WebView2 também guarda seus dados em `portable/webview/`. Requisito: WebView2 Runtime (já vem no Windows 10/11 atualizados).

## Visualizadores como módulos (0.80)
`src/visualizadores/registro.js` guarda a lista de visualizadores. Cada módulo se registra:

```js
UDS.registerViewer({
  id: 'meu-formato', nome: 'Meu formato',
  match: (caminho, doc) => caminho.endsWith('.xyz'),
  open: (caminho, doc, container, ctx) => { container.textContent = 'Olá'; }
});
```
Depois inclua `<script src="visualizadores/meu-formato.js"></script>` no `index.html`. O núcleo não precisa mudar.

## Testes (0.50)
- `npm test` roda `tests/core.test.js` (funções puras de `src/core.js`).
- `cargo test --manifest-path src-tauri/Cargo.toml` roda os testes do núcleo Rust.
