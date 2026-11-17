---
name: Caixa
description: Caixa registradora de balcão para eventos beneficentes, em tema claro e acolhedor, com a paleta do logo da 7ª Paella Mineira Solidária (vinho, laranja e creme)
colors:
  cor-primaria: "#902539"
  cor-primaria-hover: "#721B2E"
  cor-acento: "#E87717"
  cor-acento-hover: "#F58B2A"
  cor-fundo: "#FFF7EA"
  cor-fundo-secundario: "#F5E9DB"
  cor-superficie: "#FFFCF7"
  cor-superficie-elevada: "#FFFFFF"
  cor-texto: "#351C24"
  cor-texto-secundario: "#715D62"
  cor-texto-claro: "#FFFFFF"
  cor-borda: "#DECBBA"
  cor-foco: "#902539"
  cor-erro: "#B42335"
  cor-sucesso: "#286A4C"
  aviso: "#9A5107"
shadows:
  sombra-suave: "0 8px 26px rgba(53, 28, 36, 0.08)"
typography:
  display: { fontFamily: "Public Sans, Segoe UI, system-ui, sans-serif", fontSize: "34px", fontWeight: 700, lineHeight: 1.1 }
  headline: { fontSize: "26px", fontWeight: 700, lineHeight: 1.1 }
  title: { fontSize: "20px", fontWeight: 700, lineHeight: 1.2 }
  body: { fontSize: "17px", fontWeight: 400, lineHeight: 1.5 }
  label: { fontSize: "16px", fontWeight: 600, lineHeight: 1.2 }
  figure: { fontSize: "clamp(40px, 3.6vw, 50px)", fontWeight: 700, lineHeight: 1, fontFeature: "tabular-nums" }
rounded: { sm: "4px", md: "8px", lg: "12px" }
spacing: { xs: "4px", sm: "8px", md: "12px", lg: "16px", xl: "24px", xxl: "32px", xxxl: "48px" }
---

# Design System: Caixa

## Overview

**Norte criativo: "O Balcão da Paella"**

Uma ferramenta de balcão para voluntários em pé, atendendo fila, muitos deles com pouca familiaridade com sistemas. A interface é clara e acolhedora, como a arte do evento: fundo creme, texto em marrom vinho, vinho institucional nas ações principais e laranja só em detalhes. Tudo que se toca tem 48px ou mais, os números são tabulares e o texto base é 17px.

A identidade é fiel ao logo oficial da 7ª Paella Mineira Solidária, que usa vinho, laranja e creme. O logo horizontal (arquivos em `public/assets/mark`) aparece no cabeçalho e na entrada, sem alterar suas cores. O selo da Loja anfitriã (`loja.png`) aparece no rodapé da entrada e no canto do cabeçalho, com o nome editável em Ajustes. A densidade é média e orientada à tarefa: o catálogo à esquerda e o pedido em uma coluna fixa à direita, em forma de canhoto. O voucher impresso é um mundo à parte: preto e branco puro para impressora térmica.

**Características:**
- Tema claro quente. Sem degradês fortes, sem sombras pesadas, sem cores fora da paleta.
- Botão principal em vinho com texto branco. Laranja só como destaque.
- Alvos de toque e clique de 48px no mínimo; confirmar a venda tem 60px.
- Números sempre tabulares; o total e os contadores aparecem em vinho.
- Cada produto mostra uma imagem no topo do bloco: foto enviada ou ícone padrão.
- Canhoto do pedido com recortes serrilhados e saída animada ao confirmar.

## Colors

As variáveis `--cor-*` no começo de `public/styles.css` são a fonte única de cor. Os nomes curtos usados pelos componentes (`--wine`, `--accent`, `--ground`, `--surface`, `--raised` e outros) apontam para elas.

- **Vinho** (`--cor-primaria`, hover `--cor-primaria-hover`): botão principal, aba ativa, números de destaque, foco e seleção.
- **Laranja** (`--cor-acento`): ícones, sublinhado da aba ativa, contador do item, pontos de cor. Quando é fundo, o texto é escuro (`--cor-texto`), nunca branco. Nunca é texto corrido, porque tem pouco contraste sobre o creme.
- **Creme** (`--cor-fundo`): fundo geral. **Areia** (`--cor-fundo-secundario`): área das fotos, canhoto do ticket, apoio de botões e blocos de imagem.
- **Superfície e Elevada** (`--cor-superficie`, `--cor-superficie-elevada`): cartões, cabeçalho, campos e diálogos.
- **Texto** (`--cor-texto`) e **secundário** (`--cor-texto-secundario`), **borda** (`--cor-borda`).
- **Estados:** `--cor-erro`, `--cor-sucesso` e um âmbar escuro (`--warn`) para avisos de estoque baixo.

Contraste medido (WCAG): todos os textos usados passam de 4,5:1. A única exceção conhecida é a borda dos campos em repouso (`#DECBBA` sobre branco, 1,6:1), definida assim pelo cliente; o foco em vinho e o fundo branco do campo compensam.

**Regra do Laranja de Detalhe.** Laranja nunca vira texto e nunca é botão principal.
**Regra do Vinho com Propósito.** O vinho marca ação, seleção e número. Não cobre blocos grandes do app.

## Typography

Public Sans variável autohospedada (`assets/fonts/PublicSans.ttf`, licença OFL), com Segoe UI e system-ui de reserva. Uma família só, caixa normal, hierarquia por peso (400, 600, 700) e tamanho.

- **Display** 34px 700: título de página. **Headline** 26px: título do canhoto. **Title** 20px: produtos e painéis. **Body** 17px. **Label** 16px 600. **Figure** `clamp(40px, 3.6vw, 50px)`: total do pedido.
- Todo valor monetário e quantidade usa `tabular-nums`. A caixa alta pertence só ao voucher.

## Layout

Cabeçalho claro de 78px (66px abaixo de 760px de altura, 60px abaixo de 680px) com o logo horizontal de 60px (46 e 42 nas telas baixas, 38px no celular). O conteúdo rola abaixo, com largura máxima de 1560px. A tela do caixa tem duas colunas: catálogo flexível e canhoto de 430px.

Páginas internas centralizadas: Vendas até 1240px, Produtos e Equipe até 980px, formulários até 760px e Ajustes em duas colunas até 1040px. Quebras: 1500 e 1380px comprimem o cabeçalho; 1100px move as abas para uma segunda linha, empilha a entrada e esconde o selo do cabeçalho; 900px passa o caixa para coluna única; 640px esconde o nome do evento. Movimento reduzido zera animações.

## Elevation & Depth

Plano com bordas de 1px e uma sombra única e suave (`--sombra-suave`). Botões sobem 1px no hover e afundam no clique. Blocos de produto sobem 2px no hover. Painéis e tabelas ficam sem sombra em repouso.

## Shapes

Cantos de 8px em controles, 12px em painéis, blocos, canhoto e fotos, 4px em selos. O traço de assinatura é o recorte serrilhado do canhoto e os dois recortes redondos do ticket da entrada, que seguem a linha tracejada de picote.

## Components

- **Botão principal:** vinho, texto branco, 48px (60px para confirmar a venda). Hover em `--cor-primaria-hover`. Desativado fica tracejado.
- **Botão comum:** branco com borda; hover em areia. **Perigo:** transparente, texto e borda em `--cor-erro`.
- **Campos:** fundo branco, borda `--cor-borda`, 52px; foco com contorno de 2px em vinho.
- **Cabeçalho:** logo horizontal, abas com ícone e rótulo, aba ativa em vinho com sublinhado laranja, selo da loja, estado da impressora, nome e Sair.
- **Bloco de produto:** fundo Superfície, imagem de 108px, nome, ponto de cor, preço e estoque. Selecionado: borda vinho.
- **Canhoto do pedido:** Superfície com recortes serrilhados, total em vinho, forma de pagamento em três botões e faixa de troco.
- **Ticket da entrada:** cabeçalho em areia com a edição, picote tracejado com dois recortes, e vendidas e disponíveis em vinho sobre branco.
- **Entrada:** metade esquerda em areia com duas fotos e, abaixo, a Loja anfitriã; à direita o logo, o formulário e o ticket.
- **Tabelas e resumo:** tabela real com cabeçalho secundário, números à direita e valores do resumo em vinho.
- **Ajustes:** nome do evento, em prol de, Loja anfitriã, edição, produto do contador, papel e voucher, recomeço do zero e cópia de segurança.
- **Voucher térmico:** preto sobre branco, na largura do papel (58 ou 80mm). Com o nome de evento padrão, usa o logo horizontal em preto e branco; com outro nome, usa o emblema e o nome do evento. Rodapé com "k/n", data, número, "Em prol do ..." e "Loja anfitriã: ...".

## Do's and Don'ts

### Do:
- **Do** usar as variáveis `--cor-*` e reaproveitar os nomes curtos em vez de criar cores novas.
- **Do** manter botão principal em vinho com texto branco e laranja só em detalhes.
- **Do** dar 48px ou mais a todo alvo clicável e 60px ao confirmar a venda.
- **Do** usar `tabular-nums` em dinheiro e quantidades.
- **Do** usar o logo oficial sem alterar suas cores e a Public Sans em toda a interface.
- **Do** manter o voucher em preto e branco puro.
- **Do** desligar o movimento decorativo da entrada com `prefers-reduced-motion`.

### Don't:
- **Don't** usar laranja como cor de texto ou como fundo de botão principal.
- **Don't** usar degradês fortes, sombras pesadas, brilhos ou cores fora da paleta.
- **Don't** cobrir áreas grandes do app com vinho.
- **Don't** usar caixa alta ou fonte condensada em títulos, botões, rótulos ou dados da interface.
- **Don't** pôr sombra em painéis e tabelas em repouso.
