# Visualizar

Uma **prévia flutuante** de qualquer arquivo ou pasta, sem abrir aba e sem alterar nada. No explorador, clique com o **botão direito** em um arquivo ou pasta e escolha **Visualizar** (é o primeiro item do menu; os outros continuam na mesma ordem).

## O que aparece
| Item | Prévia |
|---|---|
| Imagem | O visualizador de imagens (zoom, giro, ajuste) |
| Áudio | O player de áudio, com forma de onda, capa e dados técnicos |
| Vídeo | O player de vídeo, com controles e a tabela técnica |
| Texto e código | Só leitura, com cores e numeração de linhas (as primeiras 3000 linhas; abaixo disso, um aviso) |
| Pasta | Quantos itens (pastas e arquivos), **miniaturas das imagens** (até 24) e a lista (até 300 itens). Clique em um item para visualizá-lo ali mesmo; o botão **◀** volta |
| Formato reconhecido sem visualizador (PDF, ZIP…) | A tela de informações, com **Mostrar como texto** |

Os visualizadores são **os mesmos** das abas, então tudo que for ganhando novos visualizadores (Markdown, PDF, 3D…) passa a aparecer na prévia sozinho.

## A janela
- Abre **encostada à direita**, para o explorador continuar livre: dá para clicar com o botão direito em outro arquivo e ver a prévia mudar.
- Arraste pela barra de cima para mover; arraste o canto para mudar o tamanho.
- **Abrir no UDS** abre o arquivo em uma aba e fecha a prévia.
- **`Esc`** fecha a prévia. Se a caixa de configurações também estiver aberta, o primeiro `Esc` fecha só a prévia. Em tela cheia de vídeo, o `Esc` só sai da tela cheia.
- Ao fechar (ou trocar de arquivo), o áudio e o vídeo **param** e liberam o arquivo.

## Limites
- A prévia de pasta mostra **quantidade e tipo**, ainda não **tamanho e data**: o núcleo em Rust só informa nome, caminho e se é pasta. Mostrar tamanho e data exige um comando novo no Rust (veja `ideias.md`).
- Só vale para o explorador. Visualizar um arquivo dos *Editores abertos*, da busca ou do terminal ainda não existe.
- Uma prévia por vez.

## Como funciona por dentro
1. `src/visualizar.js` cria a janela (`#prevwin`, no `index.html`) e escolhe o conteúdo: pasta (`list_dir`), ou arquivo (`lerDoc` → `UDS.findViewer`). Se há visualizador, ele abre dentro da janela com um `ctx` **próprio** (a limpeza da prévia não derruba o visualizador da aba). Se não há e é texto, mostra em leitura; senão, informações.
2. Os visualizadores só procuram elementos **dentro do contêiner recebido**, por isso funcionam em qualquer lugar.
3. As partes puras (`resumoPasta`, `rotuloTipo`, `limitarTexto`, `descreverPasta`) são testadas sem tela.

## Testes
- `npm test`: `tests/visualizar.test.js` (resumo de pasta, singular e plural, limite de linhas) e a ligação no `app.js` em `tests/modos.test.js`.
- `node tests/inicio.navegador.js` (opcional): confere o item **Visualizar** no topo com os itens antigos na mesma ordem, o menu da área vazia intacto, a prévia de texto (só leitura, sem abrir aba), imagem, áudio, **vídeo tocando**, PDF, pasta com miniaturas, navegar dentro e voltar, `Esc` na ordem certa e **Abrir no UDS**.
