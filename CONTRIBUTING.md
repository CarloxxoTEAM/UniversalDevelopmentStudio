# Contribuindo com o UDS

1. Faça um fork e crie um branch: `git checkout -b minha-melhoria`.
2. Rode `npm install` e `npm run dev` para testar.
3. Rode `cargo test --manifest-path src-tauri/Cargo.toml` antes de enviar.
4. Abra um Pull Request descrevendo o que mudou e por quê.

Mudanças no núcleo (`src-tauri/`) devem ser pequenas e testadas. Novos formatos e ferramentas devem, sempre que possível, ser módulos separados.
