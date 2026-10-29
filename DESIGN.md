---
name: Caixa
description: Caixa registradora de balcão para eventos beneficentes, em tema escuro quente, vinho, laranja e creme, com relevo tátil nos controles.
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
    fontFamily: "Public Sans, Segoe UI, system-ui, sans-serif"
    fontSize: "34px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Public Sans, Segoe UI, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Public Sans, Segoe UI, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "Public Sans, Segoe UI, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Public Sans, Segoe UI, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.2
  figure:
    fontFamily: "Public Sans, Segoe UI, system-ui, sans-serif"
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
    height: "78px"
  tile:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.cream}"
    rounded: "{rounded.lg}"
    padding: "8px 8px 16px"
  tile-hover:
    backgroundColor: "{colors.raised}"
  tile-selected:
    backgroundColor: "{colors.raised}"
  tile-media:
    backgroundColor: "{colors.raised-2}"
    rounded: "{rounded.md}"
    height: "108px"
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

A densidade é média e orientada à tarefa. O catálogo ocupa a esquerda, o pedido ocupa uma coluna fixa à direita em forma de canhoto de comanda, com bordas serrilhadas. Uma única família, a Public Sans, em caixa normal, carrega títulos e dados; a hierarquia vem de peso e tamanho, não de condensação ou caixa alta. Os controles têm relevo tátil: sobem ao passar o mouse e afundam ao clicar, como botões de uma máquina de balcão. O voucher impresso é um mundo à parte: preto e branco puro para impressora térmica.

A marca é a logo oficial do cliente (arquivos em assets/mark): logo completa no cabeçalho e no login, emblema em preto e branco no voucher. A interface não exibe número de edição.

**Key Characteristics:**
- Tema escuro quente, nunca preto neutro nem cinza frio.
- Laranja raro: botão principal, aba ativa, item selecionado ou encontrado, contador do item.
- Alvos de toque e clique de 48px no mínimo; confirmar a venda tem 60px.
- Números sempre tabulares; o total é a maior figura da tela.
- Relevo tátil em botões, campos rebaixados e blocos de produto, com hover que sobe e clique que afunda.
- Cada produto mostra uma imagem no topo do bloco: foto enviada ou ícone padrão.
- Canhoto do pedido com recortes serrilhados e saída animada ao confirmar.
- Tabelas reais, resumo em faixa, estados vazios tipográficos (sem ilustração).

## Colors

Paleta fixa aprovada pelo cliente: vinho, laranja e creme sobre marrom escuro. Cores e logo não são editáveis pela interface.

### Primary
- **Laranja Paella** (accent): botão principal (em degradê vertical sutil), sublinhado da aba ativa, contorno do item selecionado ou encontrado, contador sobre o produto, cursor de texto, caixas de marcação, brilho de fundo do login. Texto sobre ele usa Tinta Brasa (on-accent).
- **Vinho Salão** (wine): fundo do cabeçalho e faixa de marca do login (em Vinho Fundo, wine-deep). Vinho Fundo também é a borda inferior do cabeçalho e a moldura da segunda foto do login.

### Neutral
- **Creme Mesa** (cream): texto principal, anel de foco, borda de seleção de pagamento.
- **Marrom Noite** (ground): fundo da página e dos campos de entrada (rebaixados).
- **Superfície, Elevado, Elevado 2** (surface, raised, raised-2): três degraus tonais para painéis, canhoto, botões e a área de imagem do produto, do mais fundo ao mais alto.
- **Fio e Fio Forte** (line, line-strong): divisórias de tabela e bordas de controles.
- **Areia Apagada** (muted): texto secundário, rótulos de coluna, preços nos itens.
- **Verde Troco, Salmão Erro, Âmbar Aviso** (ok, danger, warn): estados apenas. Verde para conectado e troco suficiente, salmão para erro e troco insuficiente, âmbar para selo de alerta.

### Named Rules
**A Regra do Laranja Escasso.** O laranja é reservado ao botão principal, à aba ativa e ao item selecionado. Não aparece como decoração, em títulos nem em links.
**A Regra do Vinho Contido.** O vinho vive no cabeçalho e na arte lateral do login. Painéis e fundos do app usam a escala marrom.

## Typography

**Display Font:** Public Sans variável autohospedada (assets/fonts/PublicSans.ttf, licença OFL, pesos 100 a 900), com Segoe UI e system-ui de reserva
**Body Font:** a mesma Public Sans
**Label/Mono Font:** nenhuma; números usam tabular-nums

**Character:** uma família só, neutra e legível a distância. Títulos em caixa normal, peso 700, tracking levemente fechado (-.01em); nada condensado, nada em caixa alta na interface.

### Hierarchy
- **Display** (700, 34px, 1.1, -.01em): título de página. No login o título do formulário usa 38px (30px em telas baixas).
- **Headline** (700, 26px, 1.1, -.01em): título do canhoto "Pedido" (22px em telas baixas).
- **Title** (700, 20px, 1.2): nomes de produto, títulos de painel e estado vazio; 24px em diálogos.
- **Body** (400, 17px, 1.5): texto corrido. Texto de apoio e rótulos 16px.
- **Label** (600, 16px): rótulos de campo, cabeçalhos de tabela (em Areia Apagada), abas, botões.
- **Figure** (700, tabular, clamp(40px, 3.6vw, 50px)): total do pedido. Troco 28px, valores do resumo 28px.

### Named Rules
**A Regra da Voz Única.** Uma família, caixa normal. Hierarquia por peso (400, 600, 700) e tamanho.
**A Regra do Número Alinhado.** Todo valor monetário e quantidade usa tabular-nums e alinha à direita nas tabelas.

## Layout

Cabeçalho de 78px (66px abaixo de 760px de altura, 60px abaixo de 680px), com logo completa de 54px (46 e 42 nas telas baixas). O conteúdo rola abaixo, com largura máxima de 1560px e respiro de 24px. A tela do caixa é uma grade de duas colunas: catálogo flexível e canhoto de 430px, com 24px entre elas. O catálogo é grade automática de blocos de no mínimo 210px.

Páginas internas são centralizadas, com 24px de intervalo: Vendas até 1240px, Produtos e Equipe até 980px (compacta), formulários estreitos até 760px e Ajustes em duas colunas até 1040px (uma coluna abaixo de 900px).

Escala de espaçamento: 4, 8, 12, 16, 24, 32, 48. Quebras observadas: 1500px e 1380px comprimem o cabeçalho (atalhos de teclado somem); 1100px move as abas para uma segunda linha e empilha o login; 900px passa a caixa para coluna única; 640px esconde o nome do evento no cabeçalho. Em telas baixas (até 760px de altura, largura acima de 900px) o pedido compacta: a linha do item vira uma fileira só (nome, contador, valor), a unidade some e o total, o troco e o botão de confirmar encolhem; abaixo de 680px some também o subtítulo do canhoto. Movimento reduzido zera animações.

## Elevation & Depth

Híbrido: degraus tonais marrons mais relevo tátil nos controles. Botões, blocos de produto e o canhoto sobem com realce interno no topo e sombra de queda; campos de texto são rebaixados com sombra interna. Painéis, tabelas e resumos ficam planos, diferenciados por degrau e borda de 1px. Hover sobe 1px (botões) ou 2px (blocos de produto) e aprofunda a sombra; clique afunda (botão desce 1px com sombra interna, bloco encolhe a 98,5%).

### Shadow Vocabulary
- **Botão comum** (`inset 0 1px 0 rgb(255 255 255 / .07), 0 2px 0 rgb(0 0 0 / .28)`): em repouso; hover `inset 0 1px 0 rgb(255 255 255 / .1), 0 4px 10px rgb(0 0 0 / .32)`; ativo `inset 0 2px 4px rgb(0 0 0 / .35)`.
- **Botão primário** (`inset 0 1px 0 rgb(255 255 255 / .4), inset 0 -2px 0 rgb(0 0 0 / .16), 0 6px 14px rgb(0 0 0 / .38)`): degradê vertical do laranja, mais claro no topo; brilho no topo e sombra de queda.
- **Campo** (`inset 0 2px 5px rgb(0 0 0 / .4)`): entalhe de campo rebaixado.
- **Bloco de produto** (`inset 0 1px 0 rgb(255 255 255 / .04), 0 2px 6px rgb(0 0 0 / .3)`): repouso; hover com queda `0 10px 20px rgb(0 0 0 / .4)`.
- **Canhoto** (`0 1px 0 rgb(255 255 255 / .04) inset, 0 8px 24px rgb(0 0 0 / .35)`): painel do pedido.
- **Diálogo** (`0 24px 60px rgb(0 0 0 / .55)`): janelas modais.
- **Aviso** (`0 12px 32px rgb(0 0 0 / .5)`): toasts.

### Named Rules
**A Regra do Relevo que Responde.** Todo controle clicável sobe no hover e afunda no clique; o relevo existe para dizer "isto aperta". Painéis, tabelas e resumos não têm sombra.

## Shapes

Cantos suavemente arredondados: 8px em controles e áreas de imagem, 12px em painéis, blocos e canhoto, 4px em selos e teclas. Contadores e pontos de status são círculos. A assinatura é o recorte serrilhado de semicírculos (16px de passo) no topo e na base do canhoto, feito com gradiente radial na cor do fundo da página. Divisórias de itens no pedido são tracejadas; botões desativados trocam preenchimento por borda tracejada. No login, as fotos têm cantos de 12px e a segunda leva moldura de 6px em Vinho Fundo.

## Components

### Buttons
- **Shape:** cantos de 8px, altura mínima 48px, texto 600, relevo tátil (ver Elevation & Depth).
- **Primary:** laranja em degradê vertical sutil com texto Tinta Brasa, peso 700; um por contexto.
- **Confirmar venda:** primário de 60px de altura (56 e 52 em telas baixas), largura total, 20px.
- **Default:** Elevado 2 com borda Fio Forte. **Ghost:** transparente com borda. **Danger:** transparente, texto e borda salmão.
- **Hover / Focus:** clareia e sobe 1px; ativo afunda 1px; foco é anel creme de 3px com 2px de afastamento. Desativado fica tracejado, sem preenchimento e sem sombra.

### Inputs / Fields
- **Style:** fundo Marrom Noite rebaixado com sombra interna, borda Fio Forte, 8px, 52px de altura; versão grande de 26px para valor recebido.
- **Focus:** borda e contorno creme de 2px. **Erro:** texto salmão 16px em negrito abaixo do campo.
- A busca é um campo largo de 60px com ícone, no topo do catálogo.

### Navigation
Abas no cabeçalho vinho, ao lado da logo completa: ícone e rótulo em 600, creme atenuado; hover com véu branco de 8%; ativa em creme 700, ícone com preenchimento duotone e sublinhado laranja de 3px. Atalho de teclado em pequena tecla com contorno. Em telas estreitas as abas rolam horizontalmente ou ocupam segunda linha.

### Bloco de produto
Bloco de 12px, fundo Superfície, com área de imagem de 108px no topo (cantos de 8px, fundo Elevado 2): a foto enviada pelo administrador, recortada para cobrir, ou um ícone padrão do kit escolhido pelo nome do produto. Abaixo, nome 20px 700 com ponto de cor do produto e preço 19px em Areia Apagada. Relevo em repouso; hover sobe 2px e passa ao degrau Elevado. Selecionado: borda laranja e fundo Elevado. Quantidade no pedido aparece em círculo laranja no canto, com pequena animação de surgimento. No cadastro, a escolha da foto usa a mesma área de imagem em 96px.

### Canhoto do pedido (assinatura)
Painel Elevado com recortes serrilhados nas pontas, título "Pedido", linhas tracejadas por item com contador (48px), subtotal tabular, total grande acima de uma régua de 2px, seletor de forma de pagamento em três botões (o pressionado ganha borda creme de 2px e fundo mais alto), atalhos de valores em dinheiro e faixa de troco (verde ou salmão). Ao confirmar a venda, um clone do canhoto sobe 12% e desaparece em 420ms; com movimento reduzido não anima.

### Tabelas e resumo
Tabela real: cabeçalho em Areia Apagada com linha forte, linhas com fio, hover em Elevado, colunas numéricas à direita e ações à direita. O resumo é uma faixa horizontal de células separadas por fio, cada uma com legenda e valor de 28px. Selos de 4px com borda (âmbar para alerta, tracejado para inativo).

### Estados vazios
Somente tipografia: frase em 20px 700, apoio em Areia Apagada e, se couber, um botão. Sem ilustração.

### Ícones
Sprite próprio (assets/icons.svg): grade 32x32, traço de 2, pontas arredondadas, exibido a 24px, com preenchimento duotone em laranja controlado por uma variável (30% em abas ativas e opção de pagamento pressionada; 35% nos ícones padrão de produto, a 44px). Ícones herdam a cor do texto.

### Ajustes
Página em duas colunas (até 1040px) que edita só quatro campos: nome do evento, em prol de, largura do papel e altura do voucher, com ação de salvar e de imprimir voucher de teste.

### Acesso (login)
Metade esquerda em Vinho Fundo com duas fotos sobrepostas, entrada escalonada (.9s, a segunda 180ms depois), deriva lenta das imagens (22 e 27s), parallax leve de 9px e -15px seguindo o mouse, reflexo de luz que cruza as fotos a cada 10s e brilho laranja que se move devagar ao fundo. Uma divisa em degradê de 240px funde o vinho ao Marrom Noite do formulário. Formulário à direita com logo completa de até 340px, entrada escalonada de cada bloco. Tudo isso desliga com prefers-reduced-motion; abaixo de 1100px o login empilha.

### Voucher térmico
Preto sobre branco, sem cinza, na largura do papel (58 ou 80mm) e altura configurável. Public Sans variável, peso 800. Cabeçalho com emblema preto e branco (11mm) e nome do evento em caixa alta e negrito, filete sólido abaixo. Nome do produto em caixa alta e negrito ocupando o centro, com corpo ajustado ao tamanho do nome (10, 7,6, 5,6 ou 4,6mm). Rodapé tracejado com contagem "k/n", data e número da venda, e linha "Em prol do ...". Um voucher por unidade. A caixa alta pertence só ao voucher.

## Do's and Don'ts

### Do:
- **Do** manter o laranja (#E8833A) só no botão principal, na aba ativa e no item selecionado.
- **Do** dar 48px ou mais a todo alvo clicável e 60px ao confirmar a venda.
- **Do** usar tabular-nums em dinheiro e quantidades.
- **Do** compor profundidade por degraus tonais marrons, bordas de 1px e o relevo tátil dos controles (sobe no hover, afunda no clique).
- **Do** usar ícone junto de rótulo de texto nas abas e nas formas de pagamento.
- **Do** usar a logo oficial dos arquivos em assets/mark e a Public Sans em toda a interface.
- **Do** dar a todo produto uma imagem no topo do bloco (foto ou ícone padrão).
- **Do** manter o voucher em preto e branco puro, com o emblema preto e branco.
- **Do** desligar todo movimento decorativo do login com prefers-reduced-motion.

### Don't:
- **Don't** usar o vinho nos painéis e fundos do app; ele é do cabeçalho e da arte do login.
- **Don't** usar caixa alta ou fonte condensada em títulos, botões, rótulos ou dados da interface.
- **Don't** usar preto neutro, cinza frio ou branco puro na interface (o branco puro é só do voucher).
- **Don't** pôr sombra em painéis, tabelas e resumos em repouso.
- **Don't** exibir número de edição em qualquer lugar da interface.
- **Don't** usar emojis, ilustrações em estados vazios ou texto com travessão.
