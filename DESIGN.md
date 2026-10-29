---
name: Caixa
description: Caixa registradora de balcão para eventos beneficentes, em tema escuro quente, vinho, laranja e creme.
colors:
  wine: "#6B1A10"
  wine-deep: "#4A110A"
  accent: "#E8833A"
  on-accent: "#1D0804"
  cream: "#F5EBDD"
  ground: "#170D0B"
  surface: "#211412"
  raised: "#2B1A17"
  raised-2: "#382320"
  line: "#3C2925"
  line-strong: "#5E433C"
  muted: "#C4B0A3"
  ok: "#8FD19A"
  danger: "#FF9F8F"
  warn: "#F2B35E"
typography:
  display:
    fontFamily: "Archivo, Segoe UI, system-ui, sans-serif"
    fontSize: "36px"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "0.03em"
    fontVariation: "font-stretch 75%, caixa alta"
  headline:
    fontFamily: "Archivo, Segoe UI, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "0.03em"
    fontVariation: "font-stretch 75%, caixa alta"
  title:
    fontFamily: "Archivo, Segoe UI, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "Archivo, Segoe UI, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Archivo, Segoe UI, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.2
  figure:
    fontFamily: "Archivo, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(40px, 3.6vw, 50px)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.01em"
    fontFeature: "tabular-nums"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "32px"
  xxxl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "48px"
  button-default:
    backgroundColor: "{colors.raised-2}"
    textColor: "{colors.cream}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "48px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.cream}"
    rounded: "{rounded.md}"
    height: "48px"
  button-danger:
    backgroundColor: "transparent"
    textColor: "{colors.danger}"
    rounded: "{rounded.md}"
    height: "48px"
  button-confirm:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.md}"
    height: "60px"
  input:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.cream}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "52px"
  topbar:
    backgroundColor: "{colors.wine}"
    textColor: "{colors.cream}"
    height: "68px"
  tile:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.cream}"
    rounded: "{rounded.lg}"
    padding: "16px"
  tile-selected:
    backgroundColor: "{colors.raised}"
  slip:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.cream}"
    rounded: "{rounded.lg}"
    padding: "24px 0 16px"
  panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "24px"
  badge:
    textColor: "{colors.warn}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
---

# Design System: Caixa

## Overview

**Creative North Star: "O Balcão da Paella"**

Uma ferramenta de balcão para voluntários em pé, atendendo fila, muitos deles com pouca familiaridade com sistemas. A interface é escura e quente, como um salão à noite: fundo quase marrom, cabeçalho vinho, creme para texto e um único laranja que marca a ação. Tudo que se toca tem 48px ou mais, os números são tabulares e o texto base é 17px.

A densidade é média e orientada à tarefa. O catálogo ocupa a esquerda, o pedido ocupa uma coluna fixa à direita em forma de canhoto de comanda, com bordas serrilhadas. Tipografia condensada e pesada em caixa alta dá voz de cartaz de evento aos títulos; todo o resto é Archivo normal, legível a distância. O voucher impresso é um mundo à parte: preto e branco puro para impressora térmica.

**Key Characteristics:**
- Tema escuro quente, nunca preto neutro nem cinza frio.
- Laranja raro: botão principal, aba ativa, item selecionado ou encontrado, contador do item.
- Alvos de toque e clique de 48px no mínimo; confirmar a venda tem 60px.
- Números sempre tabulares; o total é a maior figura da tela.
- Canhoto do pedido com recortes serrilhados e saída animada ao confirmar.
- Tabelas reais, resumo em faixa, estados vazios tipográficos (sem ilustração).

## Colors

Paleta fixa aprovada pelo cliente: vinho, laranja e creme sobre marrom escuro. Cores e logo não são editáveis pela interface.

### Primary
- **Laranja Paella** (accent): botão principal, sublinhado da aba ativa, contorno do item selecionado ou encontrado, contador sobre o produto, cursor de texto, caixas de marcação. Texto sobre ele usa Tinta Brasa (on-accent).
- **Vinho Salão** (wine): fundo do cabeçalho e nada mais. Vinho Fundo (wine-deep) é a borda inferior do cabeçalho e o fundo de reserva da arte do login.

### Neutral
- **Creme Mesa** (cream): texto principal, anel de foco, borda de seleção de pagamento.
- **Marrom Noite** (ground): fundo da página e dos campos de entrada.
- **Superfície, Elevado, Elevado 2** (surface, raised, raised-2): três degraus tonais para painéis, canhoto e botões, do mais fundo ao mais alto.
- **Fio e Fio Forte** (line, line-strong): divisórias de tabela e bordas de controles.
- **Areia Apagada** (muted): texto secundário, rótulos de coluna, preços nos itens.
- **Verde Troco, Salmão Erro, Âmbar Aviso** (ok, danger, warn): estados apenas. Verde para conectado e troco suficiente, salmão para erro e troco insuficiente, âmbar para selo de alerta.

### Named Rules
**A Regra do Laranja Escasso.** O laranja é reservado ao botão principal, à aba ativa e ao item selecionado. Não aparece como decoração, em títulos nem em links.
**A Regra do Vinho no Topo.** O vinho vive só no cabeçalho. Painéis e fundos usam a escala marrom.

## Typography

**Display Font:** Archivo variável autohospedada (assets/fonts/Archivo.ttf), com Segoe UI e system-ui de reserva
**Body Font:** a mesma Archivo, largura normal
**Label/Mono Font:** nenhuma; números usam tabular-nums

**Character:** uma família só, em duas larguras. A versão condensada a 75% e peso 800 em caixa alta faz os títulos; a largura normal carrega o resto.

### Hierarchy
- **Display** (800, 36px, 1.1, condensada 75%, caixa alta, tracking .03em): título de página.
- **Headline** (800, 26px, 1.1, mesma voz condensada): título do canhoto "Pedido". No login o título chega a clamp(52px, 6.4vw, 96px) e o formulário usa 38px.
- **Title** (700, 20px, 1.2): nomes de produto, títulos de painel e estado vazio; 24px em diálogos.
- **Body** (400, 17px, 1.5): texto corrido. Texto de apoio e rótulos 16px.
- **Label** (600, 16px): rótulos de campo, cabeçalhos de tabela (em Areia Apagada), abas, botões.
- **Figure** (700, tabular, clamp(40px, 3.6vw, 50px)): total do pedido. Troco 28px, valores do resumo 28px.

### Named Rules
**A Regra da Condensada.** Só títulos e o nome do evento usam a condensada em caixa alta. Botões, rótulos e dados nunca.
**A Regra do Número Alinhado.** Todo valor monetário e quantidade usa tabular-nums e alinha à direita nas tabelas.

## Layout

Cabeçalho fixo de 68px (56px em telas baixas), conteúdo rolando abaixo com largura máxima de 1560px e respiro de 24px. A tela do caixa é uma grade de duas colunas: catálogo flexível e canhoto de 430px, com 24px entre elas. O catálogo é grade automática de blocos de no mínimo 210px. Páginas internas têm largura máxima de 1240px (940px compacta, 760px estreita) e empilham em coluna com 24px de intervalo.

Escala de espaçamento: 4, 8, 12, 16, 24, 32, 48. Quebras observadas: 1500px e 1380px comprimem o cabeçalho (atalhos de teclado somem); 1100px move as abas para uma segunda linha e empilha o login; 900px passa a caixa para coluna única; 640px esconde o nome do evento no cabeçalho. Em telas baixas (760px e 680px) o canhoto compacta seus espaços. Movimento reduzido zera animações.

## Elevation & Depth

Híbrido, majoritariamente tonal. Painéis e blocos ficam planos, diferenciados por degraus de marrom e bordas de 1px. Só o canhoto (sombra com realce interno e queda difusa), diálogos e avisos sobem com sombra suave.

### Shadow Vocabulary
- **Canhoto** (`0 1px 0 rgb(255 255 255 / .04) inset, 0 8px 24px rgb(0 0 0 / .35)`): painel do pedido.
- **Diálogo** (`0 24px 60px rgb(0 0 0 / .55)`): janelas modais.
- **Aviso** (`0 12px 32px rgb(0 0 0 / .5)`): toasts.

### Named Rules
**A Regra do Plano em Repouso.** Blocos de catálogo, painéis e tabelas não têm sombra. Hover muda o degrau tonal.

## Shapes

Cantos suavemente arredondados: 8px em controles, 12px em painéis, blocos e canhoto, 4px em selos e teclas. Contadores e pontos de status são círculos. A assinatura é o recorte serrilhado de semicírculos (16px de passo) no topo e na base do canhoto, feito com gradiente radial na cor do fundo da página. Divisórias de itens no pedido são tracejadas; botões desativados trocam preenchimento por borda tracejada.

## Components

### Buttons
- **Shape:** cantos de 8px, altura mínima 48px, texto 600.
- **Primary:** laranja com texto Tinta Brasa, peso 700; um por contexto.
- **Confirmar venda:** primário de 60px de altura, largura total, 20px.
- **Default:** Elevado 2 com borda Fio Forte. **Ghost:** transparente com borda. **Danger:** transparente, texto e borda salmão.
- **Hover / Focus:** clareia levemente; ativo desce 1px; foco é anel creme de 3px com 2px de afastamento. Desativado fica tracejado e sem preenchimento.

### Inputs / Fields
- **Style:** fundo Marrom Noite, borda Fio Forte, 8px, 52px de altura; versão grande de 26px para valor recebido.
- **Focus:** borda e contorno creme de 2px. **Erro:** texto salmão 16px em negrito abaixo do campo.
- A busca é um campo largo de 60px com ícone, no topo do catálogo.

### Navigation
Abas no cabeçalho vinho: ícone e rótulo em 600, creme atenuado; hover com véu branco de 8%; ativa em creme 700, ícone com preenchimento duotone e sublinhado laranja de 3px. Atalho de teclado em pequena tecla com contorno. Em telas estreitas as abas rolam horizontalmente ou ocupam segunda linha.

### Tile de produto
Bloco de 12px, fundo Superfície, nome 20px 700 e preço 19px em Areia Apagada, ponto de cor do produto. Selecionado: borda laranja e fundo Elevado. Quantidade no pedido aparece em círculo laranja no canto, com pequena animação de surgimento.

### Canhoto do pedido (assinatura)
Painel Elevado com recortes serrilhados nas pontas, título condensado, linhas tracejadas por item com contador (48px), subtotal tabular, total grande acima de uma régua de 2px, seletor de forma de pagamento em três botões (o pressionado ganha borda creme de 2px e fundo mais alto), atalhos de valores em dinheiro e faixa de troco (verde ou salmão). Ao confirmar a venda, um clone do canhoto sobe 12% e desaparece em 420ms; com movimento reduzido não anima.

### Tabelas e resumo
Tabela real: cabeçalho em Areia Apagada com linha forte, linhas com fio, hover em Elevado, colunas numéricas à direita e ações à direita. O resumo é uma faixa horizontal de células separadas por fio, cada uma com legenda e valor de 28px. Selos de 4px com borda (âmbar para alerta, tracejado para inativo).

### Estados vazios
Somente tipografia: frase em 20px 700, apoio em Areia Apagada e, se couber, um botão. Sem ilustração.

### Ícones
Sprite próprio (assets/icons.svg): grade 32x32, traço de 2, pontas arredondadas, exibido a 24px, com preenchimento duotone em laranja controlado por uma variável (30% em abas ativas e opção de pagamento pressionada). Ícones herdam a cor do texto.

### Voucher térmico
Preto sobre branco, sem cinza, na largura do papel (58 ou 80mm) e altura configurável. Cabeçalho com marca em preto e branco, nome do evento condensado em caixa alta, nome do produto condensado ocupando o centro com corpo ajustado ao tamanho do nome, rodapé tracejado com contagem "k/n", data e número da venda, e linha "Em prol do ...". Um voucher por unidade.

## Do's and Don'ts

### Do:
- **Do** manter o laranja (#E8833A) só no botão principal, na aba ativa e no item selecionado.
- **Do** dar 48px ou mais a todo alvo clicável e 60px ao confirmar a venda.
- **Do** usar tabular-nums em dinheiro e quantidades.
- **Do** compor profundidade por degraus tonais marrons e bordas de 1px.
- **Do** usar ícone junto de rótulo de texto nas abas e nas formas de pagamento.
- **Do** manter o voucher em preto e branco puro, com a mesma Archivo condensada.

### Don't:
- **Don't** usar o vinho fora do cabeçalho.
- **Don't** usar a condensada em caixa alta em botões, rótulos ou dados.
- **Don't** usar preto neutro, cinza frio ou branco puro na interface (o branco puro é só do voucher).
- **Don't** usar sombra em blocos e painéis em repouso.
- **Don't** usar emojis, ilustrações em estados vazios ou texto com travessão.
