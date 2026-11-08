# Ideias e melhorias (organizadas por versão)

Aqui ficam as ideias que ainda não estão prontas. Cada uma tem uma etapa no roteiro do `README.md`, marcada com ✚. Quando uma ideia for entregue, ela sai desta lista e entra em `atualizacoes.md`.

| # | Ideia | Etapa | Situação |
|---|---|---|---|
| 1 | Tela de loading personalizada | **1.05** | Planejada |
| 2 | Tela de projetos e caminhos rápidos | **4.05** | Planejada (a tela inicial já tem *Abrir pasta*, *Abrir arquivo* e recentes, de forma simples) |
| 3 | Abas e painéis redimensionáveis, com tamanhos salvos | **4.10** | Planejada |
| 4 | Personalização dos ícones de arquivo e variações automáticas | **1.65** e **1.66** | Planejada (os ícones preto e branco, nos 2 estilos, já existem) |
| 5 | Cores das pastas | **4.30** | Parcial: pastas brancas no tema escuro e pretas no claro, **prontas na 1.0.2**. Cor individual: planejada |
| 6 | Tirar o aviso de vírus do Windows | **1.06** | Planejada (veja abaixo) |
| 7 | Configurações e "Sobre" em uma caixa separada | — | **Pronta na 1.2.0**, como caixa flutuante (engrenagem, menu do logo e `Ctrl+,`) |
| 8 | Área "Tipos de Arquivos" nas configurações | **1.65** | A lista já está pronta (1.2.0). Falta criar e editar tipos |

## 1. Tela de loading (1.05)
Referência: a tela de abertura do Adobe After Effects (painel escuro retangular, nome do programa em destaque, arte à direita, créditos pequenos e uma linha de status como *Initializing…*).

Versão do UDS: uma janela pequena, sem bordas, que aparece enquanto o programa carrega.
- Logo do UDS e nome em destaque, com o degradê laranja → rosa da identidade visual.
- Animação suave (o cubo do logo montando, barra de progresso fina e transições com fade).
- Linha de status com o que está acontecendo: *Carregando configurações…*, *Lendo ícones…*, *Abrindo o último projeto…*.
- Versão do programa no canto e a frase *One Studio. Unlimited Possibilities.*
- Some sozinha quando a janela principal estiver pronta.

## 2. Tela de projetos e caminhos rápidos (4.05)
- Seção simples com atalhos para os projetos e pastas abertos recentemente (hoje a tela inicial já lista as recentes).
- Botões **Abrir pasta** e **Abrir arquivo** no topo.
- Fixar um projeto para ele não sair da lista.

## 3. Abas e painéis redimensionáveis (4.10)
- Arrastar a borda do explorador, das notas e do painel inferior para mudar a largura e a altura, por exemplo, para ler nomes completos de arquivos.
- Arrastar a borda entre abas para ajustar a largura delas.
- Os tamanhos escolhidos são salvos em `portable/config/settings.json` e voltam ao reabrir. Um duplo clique na borda restaura o tamanho padrão.

## 4. Personalização dos ícones (1.65 e 1.66)
Detalhes em [`icones-personalizados.md`](icones-personalizados.md): pacotes de ícones em pastas (lidos como temas), criação de tipos de arquivo e geração automática das variações preto e branco a partir de um ícone.

## 5. Cores das pastas (4.30)
**Já pronto (1.0.2):** as pastas têm ícone fechado e aberto, em branco no tema escuro e em preto no tema claro, nos 2 estilos.

**Planejado:**
- Botão direito em uma pasta → *Cor da pasta…* → escolher a cor.
- A cor é aplicada sobre o ícone (os ícones de pasta são monocromáticos, então qualquer cor funciona).
- As escolhas ficam salvas e continuam depois de reiniciar. Formato, seguindo o exemplo enviado:

```
portable/config/folder_colors/
├── pasta_jogo.xml
└── pasta_modelos.xml
```
```xml
<?xml version="1.0" encoding="UTF-8"?>
<FolderSettings>
  <FolderName>pasta_jogo</FolderName>
  <FolderPath>D:/custom_projects/pasta_jogo</FolderPath>
  <FolderColor>#FF5733</FolderColor>
</FolderSettings>
```
O campo `FolderPath` é um acréscimo ao exemplo original: duas pastas diferentes podem ter o mesmo nome (`src`, `assets`...), e só o caminho completo permite distinguir uma da outra. `FolderName` continua existindo.

*Observação:* o texto original dizia "tema escuro: pastas brancas" e "tema preto: pastas brancas". Foi entendido que o segundo é o **tema claro**, com pastas **pretas**. Se não for isso, avise.

## 6. Aviso do Windows (1.06)
O aviso *"O Windows protegeu seu PC"* (SmartScreen) aparece porque o executável **não é assinado** e ainda não tem reputação. Não dá para removê-lo só com código. Os caminhos reais são:

1. **Assinatura de código gratuita para projetos de código aberto.** A SignPath Foundation oferece isso mediante solicitação e aprovação do projeto. O UDS tem repositório público e licença MIT, o que se encaixa. O GitHub Actions pode assinar o `.exe` a cada release.
2. **Reputação.** Mesmo assinado, o SmartScreen pode avisar nos primeiros downloads. A reputação cresce conforme mais pessoas baixam e executam o arquivo.
3. **Enviar o arquivo à Microsoft** (*Submit a file for malware analysis*) quando o antivírus apontar falso positivo.
4. **Boas práticas já adotadas:** código aberto, releases só pelo GitHub, build automático e público. Ainda a fazer: publicar o hash (SHA-256) de cada ZIP e preencher o nome e a versão nas propriedades do `.exe`.

Até lá, o usuário clica em *Mais informações* e depois em *Executar assim mesmo*, como está no `README.md`.

## 7. Configurações e "Sobre" em uma caixa separada (pronta na 1.2.0)
A engrenagem, o item *Configurações…* do menu do logo e o atalho `Ctrl+,` abrem uma **caixa flutuante**: pode ser arrastada, redimensionada e fica aberta enquanto você trabalha, então as mudanças de tema e de ícones aparecem na tela principal na hora. Tem as abas Aparência, Editor, Tipos de arquivo, Atalhos, Extensões e Sobre; novas configurações entram como novas abas ou seções. Uma janela do sistema operacional, fora da janela principal, não é necessária por enquanto.

## 8. Área "Tipos de Arquivos" (lista pronta; criação na 1.65)
**Pronto (1.2.0):** em *Configurações → Tipos de arquivo*, uma lista com uma linha por tipo, mostrando o ícone, o nome e as extensões, com filtro:

```
[ícone HTML]   HTML        (.html, .htm)
[ícone CSS]    CSS         (.css)
[ícone GML]    GameMaker   (.gml)
```
**Falta (1.65):** editar cada linha e um botão **Criar tipo de arquivo**. Veja o passo a passo em [`icones-personalizados.md`](icones-personalizados.md).
