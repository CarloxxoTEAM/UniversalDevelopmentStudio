# Assinatura de código (etapa 1.06)

**Objetivo:** tirar (ou reduzir) o aviso *"O Windows protegeu seu PC"* que aparece ao abrir o `UniversalDevelopmentStudio.exe`. A opção gratuita para projetos de código aberto é a **SignPath Foundation**: ela empresta um certificado em nome dela, guardado em um cofre de hardware, e assina o executável **só se** ele tiver sido compilado automaticamente a partir do seu repositório público.

> Estas regras foram conferidas em **signpath.org/terms** (novembro de 2026). Elas podem mudar: antes de enviar, releia **https://signpath.org/terms** e o formulário em **https://signpath.org/apply**. A decisão de aceitar ou não o projeto é só da SignPath.

## Onde o UDS está em cada requisito

| Requisito da SignPath | Situação do UDS |
|---|---|
| Licença de código aberto aprovada pela OSI, sem dupla licença comercial | ✅ MIT (`LICENSE` na raiz) |
| Sem malware nem programas indesejados | ✅ |
| Sem código proprietário | ✅ Tudo é do próprio projeto ou de bibliotecas abertas |
| Sem "ferramentas de hacking" (que procuram ou exploram falhas) | ✅ É um editor e visualizador de arquivos |
| Respeita a privacidade; avisa se enviar dados | ✅ Não faz nenhuma conexão de rede (conferido: o código só lê arquivos locais, e o núcleo não usa nenhuma biblioteca de rede) |
| Anuncia mudanças no sistema; oferece desinstalação | ✅ Programa portátil, sem instalador. Remover = apagar a pasta |
| Compilado de forma verificável, a partir do código | ✅ GitHub Actions (`.github/workflows/build.yml`), em máquinas do GitHub, ao publicar uma tag `v*` |
| Já lançado na forma que será assinada | ✅ O ZIP do Windows está em Releases (confirme que há pelo menos uma release publicada) |
| Ativamente mantido | ✅ Há versões recentes |
| Funcionalidade descrita na página de download | ✅ O README descreve o programa e os formatos (a página de Releases usa notas geradas automaticamente: vale colar uma descrição curta lá) |
| **Política de assinatura publicada na página inicial** | ✅ Foi adicionada ao `README.md` (seção *Política de assinatura de código*). **Falta** trocar `SEU-USUARIO` pelo seu usuário do GitHub |
| Autenticação em dois fatores no GitHub e na SignPath | ⚠️ **Você** precisa ligar no GitHub (e na SignPath, quando criar a conta) |
| Papéis Autor, Revisor e Aprovador | ✅ Descritos na política (um mantenedor faz os três) |
| Metadados do `.exe` (nome e versão do produto) fixos | ✅ O Tauri grava o nome e a versão do `tauri.conf.json` no `.exe`; veja "Depois da aprovação" |
| **Reputação verificável** (para programas executáveis) | ⚠️ **É o ponto de maior risco.** Veja abaixo |

## O risco principal: reputação
A SignPath diz que, para programas executáveis que as pessoas baixam e rodam, exige *"uma certa reputação verificável"*, e que não assina binários de código que ninguém conhece. O UDS é um projeto novo. Para ajudar o pedido, vale ter **antes de enviar**:
- o repositório **público**, com o README completo (já tem: descrição, formatos, imagens em `assets-design/`) e pelo menos uma **release** publicada;
- as **capturas de tela** no README (as de `assets-design/` servem);
- qualquer sinal de uso real: estrelas, downloads das releases, issues, menções, uma página do projeto;
- um **e-mail de contato** que você acompanha (as respostas e as perguntas adicionais vêm por e-mail).

Se for recusado, não é o fim: dá para pedir de novo quando o projeto tiver mais histórico. Enquanto isso, o aviso do Windows desaparece sozinho conforme o programa é baixado e usado (a reputação do SmartScreen é por arquivo), e os `.sha256` das releases permitem conferir o download.

## O que você precisa fazer (em ordem)
1. **Ligar a autenticação em dois fatores** na sua conta do GitHub.
2. Abrir o `README.md` e trocar `SEU-USUARIO` (seção *Política de assinatura de código*) pelo seu usuário do GitHub. Confirmar que o repositório é **público** e tem uma release.
3. Em **https://signpath.org/apply**, preencher o formulário com o texto abaixo (troque os campos entre `< >`). O formulário é em inglês.
4. Esperar a resposta por e-mail. Podem pedir esclarecimentos.
5. **Só depois da aprovação**: seguir "Depois da aprovação", e só então trocar a frase da política no README para a versão com o crédito da SignPath (a frase *"Free code signing provided by SignPath.io, certificate by SignPath Foundation"* só pode aparecer quando for verdade).

## Texto do pedido (em inglês, para colar no formulário)

**Project name**
Universal Development Studio (UDS)

**Repository URL**
`<https://github.com/SEU-USUARIO/SEU-REPOSITORIO>`

**License**
MIT (OSI-approved). The LICENSE file is at the repository root. No commercial dual-licensing, no proprietary components.

**Download / release URL**
`<https://github.com/SEU-USUARIO/SEU-REPOSITORIO/releases>`

**Project description**
Universal Development Studio (UDS) is a portable file editor and viewer for Windows (Linux builds are also published), written with Tauri (Rust core) and an HTML/JavaScript interface. It edits text and source code with syntax highlighting and opens images, audio and video, identifying files by their content rather than only by extension. It is a free, general-purpose tool for developers and creators who work with many kinds of files.

The application is distributed as a portable ZIP (no installer, no registry or system configuration changes). All settings are stored in a `portable/` folder next to the program; removing the program means deleting that folder. The application does not make network connections, has no telemetry, no auto-update and no hacking or security-scanning features. It only reads and writes files that the user opens.

**Build and release process**
Release binaries are built by GitHub Actions (`.github/workflows/build.yml`) on GitHub-hosted runners, from the public repository, when a `v*` tag is pushed. The workflow runs the test suites (`npm test` and `cargo test`), builds the executable with `tauri build`, packages the portable ZIP and publishes it together with a SHA-256 file on GitHub Releases. We would sign only `UniversalDevelopmentStudio.exe`, built by this workflow, and submit it for signing from the same workflow. Each release would be approved manually.

**Team**
Single maintainer. The maintainer acts as Author, Reviewer and Approver as defined in the SignPath Foundation conditions. External contributions come as pull requests and are reviewed by the maintainer before merging. Multi-factor authentication is enabled on GitHub (and will be enabled on SignPath).

**Code signing policy page**
`<https://github.com/SEU-USUARIO/SEU-REPOSITORIO#política-de-assinatura-de-código-code-signing-policy>` (section "Política de assinatura de código (Code signing policy)" of the README).

**Privacy policy**
This program will not transfer any information to other networked systems unless specifically requested by the user or the person installing or operating it.

**Contact**
`<seu e-mail>`

## Depois da aprovação
Estes passos dependem do painel da SignPath, que só abre depois de aprovado. Aqui fica o roteiro para eu preparar o que for código quando você chegar nessa etapa.

1. **No painel da SignPath** (feito por você, seguindo as instruções que eles mandarem): criar o projeto, a política de assinatura (por exemplo `release-signing`, com aprovação manual) e um usuário de CI com um **token**. Conectar o repositório do GitHub como fonte confiável de compilação.
2. **No GitHub** (Settings → Secrets and variables → Actions): guardar o token como segredo `SIGNPATH_API_TOKEN` e o ID da organização, o *slug* do projeto e o da política como variáveis.
3. **Configuração do artefato** (arquivo `.signpath/artifact-configuration.xml` no repositório). Modelo, que prende o nome e a versão do produto, como a SignPath exige:

```xml
<?xml version="1.0" encoding="utf-8"?>
<artifact-configuration xmlns="http://signpath.io/artifact-configuration/v1">
  <parameters>
    <parameter name="version" required="true" />
  </parameters>
  <zip-file>
    <pe-file path="UniversalDevelopmentStudio.exe"
             product-name="UniversalDevelopmentStudio"
             product-version="${version}">
      <authenticode-sign />
    </pe-file>
  </zip-file>
</artifact-configuration>
```
   Depois da primeira compilação, confira em *Propriedades → Detalhes* do `.exe` se o **nome do produto** e a **versão do produto** batem exatamente com esses valores e ajuste o modelo se for preciso (eu não consigo abrir o `.exe` aqui).
4. **No fluxo de compilação** (`build.yml`), a assinatura entra **entre** compilar e montar o pacote: enviar o `.exe` para a SignPath, esperar a aprovação, baixar o `.exe` assinado e só então rodar `scripts/package.py` (que copia o `.exe` para o ZIP e calcula o SHA-256). A SignPath documenta o comando `Submit-SigningRequest` (módulo PowerShell `SignPath`, que roda no Windows do GitHub) com `-ProjectSlug`, `-SigningPolicySlug`, `-ArtifactConfigurationSlug`, `-WaitForCompletion` e `-OutputArtifactPath`; **a página da política de assinatura no painel mostra a chamada pronta**. Use essa chamada exata, em vez da minha, para não depender de uma sintaxe que pode ter mudado.
5. Como cada versão precisa de **aprovação manual**, o robô do GitHub fica esperando você aprovar no painel da SignPath (chega um e-mail). Só depois o ZIP é gerado.
6. Conferir: o `.exe` do ZIP baixado tem a aba **Assinaturas digitais** em *Propriedades*, com o editor **SignPath Foundation**. Então atualizar o README com a frase de crédito e marcar a 1.06 como pronta.

**Cuidado:** a assinatura só vale para o `.exe`. O ZIP em si não é assinado; a verificação do ZIP continua sendo o `.sha256`.

## Como eu posso ajudar depois
- Preencher o `.signpath/artifact-configuration.xml` e escrever as mudanças no `build.yml` (a assinatura entre a compilação e o pacote) assim que você tiver os *slugs* e a chamada pronta do painel.
- Atualizar o README, o `atualizacoes.md` e este guia quando a assinatura estiver funcionando.
- Se o pedido for recusado, ajustar o que eles apontarem.
