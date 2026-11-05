# Como criar um tema para o UDS

Um tema é uma **pasta** dentro de `themes/` com um arquivo chamado `theme.json`. O UDS lê todas as pastas de `themes/` ao abrir, então não precisa recompilar nada.

```
themes/
├── COMO-CRIAR-UM-TEMA.md      <- este guia
├── uds-escuro/theme.json      <- tema padrão escuro
├── uds-claro/theme.json       <- tema padrão claro
└── exemplo-oceano/theme.json  <- tema de exemplo (copie este para começar)
```

A pasta `themes/` fica ao lado do `UniversalDevelopmentStudio.exe`, e vai dentro do ZIP portátil.

## Criar o seu primeiro tema (5 passos, dá para fazer dentro do próprio UDS)
1. Abra **Configurações** (engrenagem) e clique em **Abrir pasta** logo abaixo do campo *Tema*. A pasta `themes/` aparece no explorador.
2. Copie a pasta `exemplo-oceano` e dê a cópia um nome novo, só com letras minúsculas, números e hífen. Exemplo: `meu-tema`.
3. Abra o `theme.json` da cópia e troque `"id"` para o mesmo nome da pasta (`"meu-tema"`) e `"nome"` para o que vai aparecer na lista.
4. Mude as cores que quiser e aperte **Ctrl+S**. Se o tema estiver ativo, **as cores mudam na hora**, a cada vez que você salva.
5. Em *Configurações → Tema*, escolha o seu tema na lista. Se ele não aparecer, clique em **Recarregar** (ou use *Exibir → Recarregar temas*) e olhe a aba **Output**, que explica o que está errado.

## O arquivo `theme.json`
```json
{
  "formato": 1,
  "id": "meu-tema",
  "nome": "Meu Tema",
  "autor": "Seu nome",
  "versao": "1.0.0",
  "tipo": "escuro",
  "cores": {
    "destaque": "#ff5733",
    "editor": "#101018"
  }
}
```

| Campo | Obrigatório | O que é |
|---|---|---|
| `formato` | não | Versão do formato do arquivo. Hoje é `1`. |
| `id` | **sim** | Identificador. **Precisa ser igual ao nome da pasta.** Só letras minúsculas, números e hífen (2 a 41 caracteres). |
| `nome` | **sim** | Nome mostrado na lista de temas (até 40 caracteres). |
| `tipo` | **sim** | `"escuro"` ou `"claro"`. Define as cores de base e a cor dos ícones (veja abaixo). |
| `autor` | não | Quem criou (até 60 caracteres). |
| `versao` | não | Versão do tema (até 60 caracteres). |
| `cores` | não | As cores que você quer mudar. **Pode ser só uma parte**: o que você não escrever vem do tema padrão do mesmo `tipo`. |

## As cores
Use o formato `#rgb`, `#rrggbb` ou `#rrggbbaa` (o último com transparência).

| Chave | Onde aparece | Padrão escuro | Padrão claro |
|---|---|---|---|
| `barra-superior` | Barra superior, barra de atividades (ícones à esquerda) e barra de status | `#09090b` | `#ececef` |
| `painel` | Explorador, painel de notas, barra de abas e painel inferior | `#0d0d10` | `#f5f5f7` |
| `editor` | Fundo do editor e da aba ativa | `#0b0b0d` | `#ffffff` |
| `borda` | Linhas que separam as áreas | `#1a1a1f` | `#dcdce1` |
| `texto` | Texto principal | `#c9c9d1` | `#2b2b33` |
| `texto-secundario` | Texto de apoio: números de linha, títulos de seção, dicas | `#6c6c76` | `#7a7a85` |
| `destaque` | Botões em foco, linha atual do editor, contador de notas, aba ativa das notas e do terminal | `#2f6df0` | `#1f5fe0` |
| `selecao` | Fundo do item selecionado no explorador e do texto selecionado | `#14264a` | `#d4e2fb` |
| `hover` | Fundo ao passar o mouse sobre um item | `#15151a` | `#e8e8ec` |
| `degrade-inicio` | Início do degradê do item ativo da barra de atividades e do botão "Nova nota" | `#ff8a3d` | `#ff8a3d` |
| `degrade-fim` | Fim desse degradê | `#ff3d6e` | `#ff3d6e` |
| `sintaxe-palavra-chave` | Palavras-chave (`const`, `function`, `import`...) | `#c586c0` | `#af00db` |
| `sintaxe-texto` | Textos entre aspas | `#ce9178` | `#a31515` |
| `sintaxe-comentario` | Comentários | `#5f8a50` | `#008000` |
| `sintaxe-numero` | Números | `#b5cea8` | `#098658` |
| `sintaxe-tag` | Nomes de tags (HTML, XML) | `#569cd6` | `#0000ff` |

## Tipo e ícones
O `tipo` decide a cor dos ícones de arquivo e de pasta: **`escuro` usa os ícones brancos e `claro` usa os pretos**. Por isso, um tema de fundo escuro deve ser `"escuro"` e um de fundo claro deve ser `"claro"`. Temas com ícones próprios entram na etapa 6.70 do roteiro.

## O que acontece quando algo está errado
O UDS nunca trava por causa de um tema: um tema com problema é **ignorado** e o motivo aparece na aba **Output**. Os temas `UDS Escuro` e `UDS Claro` sempre existem, mesmo que a pasta `themes/` seja apagada.

| Mensagem no Output | O que fazer |
|---|---|
| `JSON inválido` | Falta uma vírgula, aspas ou chave. Confira a linha indicada. |
| `"id" é obrigatório…` | Use só letras minúsculas, números e hífen. |
| `o "id" precisa ser igual ao nome da pasta` | Renomeie a pasta ou troque o `id`. |
| `"tipo" precisa ser "escuro" ou "claro"` | Corrija o `tipo`. |
| `a cor "x" é inválida` | Use `#rgb`, `#rrggbb` ou `#rrggbbaa`. |
| `cor desconhecida ignorada: "x"` | Só um aviso: o nome da cor não existe. Veja a tabela acima. |

## Dicas
- Confira o **contraste** entre `texto` e `editor`: o texto precisa ser fácil de ler.
- Teste com um arquivo de código e com a tela de notas aberta, para ver todas as áreas.
- Para uma variação do tema padrão, escreva só as cores que mudam.

## Compartilhar
Compacte a pasta do tema em um ZIP e envie. Quem receber extrai dentro de `themes/` e clica em **Recarregar**. A importação direta de um ZIP, com validação, está planejada para a etapa 4.50.

## Ainda não é possível
Fontes próprias, ícones próprios e CSS livre. Os dois primeiros estão planejados (etapa 6.70). O CSS livre fica de fora de propósito: um tema só troca cores, o que o torna seguro.
