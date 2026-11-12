# Ideias e melhorias (organizadas por versão)

Aqui ficam as ideias que ainda não estão prontas. Cada uma tem uma etapa no roteiro do `README.md`, marcada com ✚. Quando uma ideia for entregue, ela sai desta lista e entra em `atualizacoes.md`.

| # | Ideia | Etapa | Situação |
|---|---|---|---|
| 1 | Tela de loading personalizada | **1.05** | **Pronta na 1.4.1**, como painel dentro da janela. Falta a janela separada e sem bordas (veja abaixo) |
| 2 | Página inicial: projetos recentes e fixados, com a escolha do modo | **4.05** | **Pronta na 1.4.2** |
| 3 | Abas e painéis redimensionáveis, com tamanhos salvos | **4.10** | Planejada |
| 4 | Personalização dos ícones de arquivo e variações automáticas | **1.65** e **1.66** | Planejada (os ícones preto e branco, nos 2 estilos, já existem) |
| 5 | Cores das pastas | **4.30** | Parcial: pastas brancas no tema escuro e pretas no claro, **prontas na 1.0.2**. Cor individual: planejada |
| 6 | Tirar o aviso de vírus do Windows | **1.06** | Em andamento: texto do pedido e política de assinatura prontos ([`assinatura.md`](assinatura.md)); falta você enviar o pedido |
| 7 | Configurações e "Sobre" em uma caixa separada | — | **Pronta na 1.2.0**, como caixa flutuante (engrenagem, menu do logo e `Ctrl+,`) |
| 8 | Área "Tipos de Arquivos" nas configurações | **1.65** | A lista já está pronta (1.2.0). Falta criar e editar tipos |
| 9 | Vídeo, complementos: capturar quadro (PNG), legendas, duração de MP4 fragmentado | **1.46** | Planejada (veja abaixo) |
| 10 | Modos de trabalho (Universal, Texto, Áudio, Vídeo) | **4.02** | **Universal e Texto prontos na 1.4.2**; Áudio e Vídeo chegam com os editores (13 e 14) |
| 11 | Visualizar (prévia flutuante pelo botão direito) | **1.45** | **Pronta na 1.4.2** |
| 12 | Markdown em 2 modos, com prévia ao vivo | **1.70** (parte Markdown) | Planejada (mesma proposta) |
| 13 | Editor de áudio e Modo Áudio | **2.70** | Planejada (mesma proposta) |
| 14 | Editor de vídeo (FFmpeg) e Modo Vídeo | **2.80** | Planejada (mesma proposta). Precisa de decisão sobre o FFmpeg |

## 1. Tela de loading (1.05)
**Pronto (1.4.1):** painel de abertura com o logo montando, o nome em degradê, a linha de status com as etapas reais, a barra de progresso, a versão e a frase *One Studio. Unlimited Possibilities.* Some sozinha, pode ser pulada e desligada. Veja [`loading.md`](loading.md).

**Ainda não:**
- **Janelinha separada, sem bordas**, que aparece antes da janela principal (como a abertura do Adobe After Effects). Precisa de mudanças no Rust e nas permissões da janela; só vale fazer depois de o build no Windows estar confirmado.
- A mensagem *Abrindo o último projeto…*, quando o UDS reabrir o último projeto sozinho (4.05).

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

1. **Assinatura de código gratuita para projetos de código aberto.** A SignPath Foundation oferece isso mediante solicitação e aprovação do projeto. O UDS tem repositório público e licença MIT, o que se encaixa. O GitHub Actions pode assinar o `.exe` a cada release. **Requisitos conferidos, texto do pedido em inglês e roteiro pós-aprovação: [`assinatura.md`](assinatura.md).** O ponto de maior risco é a reputação exigida para programas executáveis.
2. **Reputação.** Mesmo assinado, o SmartScreen pode avisar nos primeiros downloads. A reputação cresce conforme mais pessoas baixam e executam o arquivo.
3. **Enviar o arquivo à Microsoft** (*Submit a file for malware analysis*) quando o antivírus apontar falso positivo.
4. **Boas práticas já adotadas:** código aberto, releases só pelo GitHub, build automático e público. O hash (SHA-256) de cada ZIP e o nome e a versão nas propriedades do `.exe` já estão prontos; a política de assinatura já está no README.

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

## 9. Vídeo, complementos (1.46)
Ideias que apareceram ao fazer o visualizador de vídeo (1.40) e ficaram de fora para a etapa continuar pequena:
- **Capturar o quadro atual como PNG.** Precisa de um comando novo no núcleo Rust para gravar arquivos binários (hoje `write_file` só grava texto), então fica para uma etapa em que o build possa ser verificado logo em seguida.
- **Legendas** `.srt` e `.vtt` ao lado do vídeo (mesmo nome), com botão para ligar e desligar.
- **Duração de MP4 fragmentado** (`moof`): hoje o painel mostra a duração que o player informa; ler os fragmentos daria o valor também para fps e taxa de bits.
- **Miniaturas na barra de posição** e marcadores de capítulos (MP4/MKV).
- **Lembrar a posição** de cada vídeo entre sessões (hoje só dura enquanto a aba está aberta).

## 10 a 14. Modos de trabalho, Visualizar, Markdown e editores (4.02, 1.45, 1.70, 2.70 e 2.80)
A proposta completa, com as versões sugeridas, o que será reaproveitado do código atual, as decisões que dependem de você e as regras de não regressão, está em [`proposta-modos-editores.md`](proposta-modos-editores.md). Em resumo:
- **Página inicial (4.05):** depois do loading, uma tela com projetos recentes (fixáveis, voltando no modo em que foram usados) e 4 cartões de função (*Universal*, *Texto*, *Áudio*, *Vídeo*).
- **Modos de trabalho (4.02):** cada modo mostra só o painel e os botões da sua função. O *Universal* é o UDS de hoje, sem mudança. `Ctrl+1` a `Ctrl+4` trocam de modo, sem perder abas nem alterações.
- **Visualizar (1.45):** item novo no botão direito do explorador; abre uma prévia flutuante reaproveitando os visualizadores que já existem.
- **Markdown (1.70, parte):** modos Código, Visualização e Dividido, como no GitHub, com conversor embutido (nada de internet).
- **Editor de áudio (2.70):** cortar, recortar e remover trecho; salvar sempre como **cópia** em WAV.
- **Editor de vídeo (2.80):** corte com FFmpeg, também sempre como cópia. O original nunca é alterado.
- **Decisões abertas:** FFmpeg dentro do ZIP, formato de saída do áudio, biblioteca de Markdown, modo padrão do `.md`, modo ao abrir um recente, nomes e atalhos dos modos, posição dos cartões, janela flutuante ou painel fixo (seção 5 da proposta).

## 15. Complementos do Visualizar e dos modos (a partir da 1.4.2)
Coisas que ficaram de fora da 1.4.2 de propósito (a versão não mexeu no núcleo em Rust, que eu não consigo compilar):
- **Tamanho e data na prévia de pasta**, e um comando `path_exists` de verdade: precisam de comandos novos no Rust (`dir_summary`, `path_exists`). Só vale fazer junto com uma mudança que o robô do GitHub possa confirmar logo em seguida.
- **Visualizar** também em *Editores abertos*, na busca e nos arquivos do terminal, e uma tecla de atalho (por exemplo `Espaço` no arquivo selecionado, como no Finder).
- **Quebra de linha** no modo Texto (exige alinhar a numeração de linhas com linhas quebradas).
- **Projetos recentes com várias pastas** (espaço de trabalho) e nomes personalizados.
