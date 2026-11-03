# Universal Development Studio (UDS)

Ambiente universal e portátil para desenvolvimento, edição e visualização de arquivos.
*One Studio. Unlimited Possibilities.*

Editor de código, explorador de arquivos, visualizador de imagens, 3D (OBJ), áudio e vídeo, terminal e Git básico, tudo na mesma janela. Roda direto de uma pasta, sem instalação.

## Usar (portátil)
1. Abra **Releases** e baixe o ZIP da sua plataforma.
2. Extraia em qualquer pasta ou pendrive.
3. Execute `UniversalDevelopmentStudio.exe` (Windows). No Linux/macOS, execute `UniversalDevelopmentStudio`.

Configurações ficam em `portable/`. Para atualizar, extraia a nova versão por cima, mantendo `portable/` e `projects/`.
Windows: precisa do WebView2 Runtime (já incluso no Windows 10/11 atualizados).

## Desenvolver
Requisitos: [Node.js 20+](https://nodejs.org), [Rust](https://rustup.rs) e os [pré-requisitos do Tauri](https://tauri.app/start/prerequisites/).

```
npm install
npm run icons    # gera os ícones a partir de app-icon.png
npm run dev      # abre o UDS em modo de desenvolvimento
npm run build    # gera o executável em src-tauri/target/release/
```

## Publicar uma versão
```
git tag v0.1.0
git push origin v0.1.0
```
O GitHub Actions compila, testa, gera os ZIPs portáteis e os publica em Releases.

Veja `docs/ARQUITETURA.md` e `CONTRIBUTING.md`. Licença: MIT.
