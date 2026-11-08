# Ícones personalizados e tipos de arquivo

## Como fazer um tipo de arquivo ter sempre o mesmo ícone

**Na versão atual (1.0.2).** Acontece em 3 passos e vale para sempre, porque o ícone fica registrado no próprio programa:

1. **Crie os 4 ícones** (Estilo 1 e 2, preto e branco). O jeito mais rápido é o gerador do projeto:
   ```
   pip install pillow
   python scripts/gerar_icone.py GML gml 12_extras
   ```
   Isso cria `gml.png` em `src/icones/estilo1/12_extras/preto|branco/` e em `src/icones/estilo2/12_extras/preto|branco/`, no mesmo traço dos demais ícones. Também dá para desenhar à mão (PNG 100 × 100, fundo transparente) seguindo `assets-design/icones-base/`.
2. **Registre a extensão** em `src/icones/indice.js`, dentro de `map`:
   ```js
   "gml":["12_extras","gml"]
   ```
   Várias extensões podem usar o mesmo ícone: `"yy":["12_extras","gml"]`.
3. **Rode `npm test`** (ele avisa se faltar algum arquivo) e publique uma nova versão. Os ícones entram dentro do programa na compilação.

**Exemplo já pronto: GameMaker.** A extensão `.gml` (GameMaker Language) já vem registrada, com ícone nos 2 estilos e nas 2 cores. Se você usa outra extensão para o mesmo tipo (por exemplo `.glm`), acrescente `"glm":["12_extras","gml"]`.

**Na versão 1.65 (planejada).** Sem mexer em código nem recompilar:
1. *Configurações → Tipos de arquivo → Criar tipo de arquivo* (a lista de tipos já existe desde a 1.2.0; o botão de criar chega na 1.65).
2. Preencher: **extensões** (`.gml`), **nome** (*GameMaker*) e **ícone**: escolher uma imagem, ou digitar a sigla (`GML`) para o UDS desenhar nos 2 estilos.
3. O UDS gera sozinho as variações preto e branco e salva o tipo em `portable/config/tipos.json`. A partir daí, todo arquivo com essa extensão usa o ícone, em qualquer pasta, mesmo depois de reiniciar.

## Pacotes de ícones (planejado para a 1.66)
Um pacote de ícones é uma **pasta** que o UDS lê como se fosse um tema. Basta colocá-la em `icones/` ao lado do executável e escolher em *Configurações → Estilo dos ícones*. Os **Estilos 1 e 2** do UDS serão pacotes iguais aos que qualquer pessoa pode criar.

```
icones/
└── meu-pacote/
    ├── pack.json                  <- nome, autor, versão
    ├── tipos.json                 <- extensão -> nome e ícone
    ├── 00_pastas/
    │   ├── branco/pasta.png
    │   ├── branco/pasta-aberta.png
    │   ├── preto/pasta.png
    │   └── preto/pasta-aberta.png
    └── 12_extras/
        ├── branco/gml.png
        └── preto/gml.png
```
`pack.json`:
```json
{ "nome": "Meu pacote", "autor": "Fulano", "versao": "1.0.0", "tamanho": 100 }
```
`tipos.json`:
```json
{
  "gml": { "nome": "GameMaker", "icone": "12_extras/gml" },
  "yyp": { "nome": "GameMaker (projeto)", "icone": "12_extras/gml" }
}
```
Regras:
- Cada ícone existe em **`branco`** (usado no tema escuro) e **`preto`** (tema claro).
- Se faltar um dos dois, o UDS cria o que falta a partir do outro, trocando a cor (variações automáticas).
- Tipos que o pacote não definir usam os ícones padrão do UDS.
- Um pacote com erro é ignorado e o motivo aparece na aba **Output**; o programa continua funcionando.

## Área "Tipos de arquivo"
**Já disponível (1.2.0):** em *Configurações → Tipos de arquivo* (ou menu do logo → *Tipos de arquivo…*), com filtro. **Planejado (1.65):** editar as linhas e criar tipos. Cada linha mostra o ícone, o nome e as extensões:

```
[ícone HTML]   HTML        (.html, .htm)
[ícone JS]     JavaScript  (.js, .mjs, .cjs)
[ícone GML]    GameMaker   (.gml)
```
Clicar em uma linha edita as extensões e o ícone. A lista também mostra quais tipos foram criados por você (`tipos.json`) e quais vêm do pacote ativo.

## Ícones de pasta
`src/icones/estilo1|estilo2/00_pastas/` tem `pasta.png` (fechada) e `pasta-aberta.png`, em preto e branco. Para refazê-los: `python scripts/gerar_icone.py --pastas`. Eles são monocromáticos de propósito, para que a cor individual de cada pasta (etapa 4.30) possa ser aplicada por cima.
