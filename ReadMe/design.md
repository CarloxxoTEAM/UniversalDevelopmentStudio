# Design e identidade visual

## Logo
Um cubo isométrico branco sobre um quadrado arredondado com degradê do laranja ao rosa. O cubo representa "universal" (vários tipos de arquivo, inclusive 3D).

| Arquivo | Uso |
|---|---|
| `assets-design/logo-uds.png` | Logo em 1024 × 1024, fundo transparente. Também é o `app-icon.png`, de onde saem os ícones do programa. |
| `assets-design/logo-uds-nome.png` | Logo com o nome e o slogan, para divulgação. |

Para trocar o logo do programa, substitua `app-icon.png` (quadrado, pelo menos 512 × 512, com transparência) e rode `npm run icons`.

## Capturas do design
`assets-design/design-uds-*.png` mostram o tema escuro, o tema claro e o visualizador de imagens.

## Paleta (tema escuro)
| Elemento | Cor |
|---|---|
| Fundo da barra superior | `#09090b` |
| Painéis laterais | `#0d0d10` |
| Editor | `#0b0b0d` |
| Bordas | `#1a1a1f` |
| Texto | `#c9c9d1` |
| Texto secundário | `#6c6c76` |
| Destaque azul (seleção, abas) | `#2f6df0` |
| Degradê de destaque (item ativo, "Nova nota") | `#ff8a3d` → `#ff3d6e` |

As cores ficam no início de `src/styles.css`, como variáveis (`--bg0`, `--ac`...), com uma versão para o tema claro.

## Nome e slogan
Universal Development Studio (UDS) · *One Studio. Unlimited Possibilities.*
