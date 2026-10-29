# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Voluntários e tesoureiros de entidades que fazem eventos beneficentes (associações, clubes, igrejas, lojas). Boa parte tem idade mais avançada e pouca familiaridade com sistemas. Trabalham no balcão, em pé, em notebook ou PC com mouse e teclado, atendendo fila. O administrador cadastra produtos e equipe e acompanha o faturamento. Os compradores do sistema são as entidades; o primeiro cliente é a Maçonaria do Paraná, na 6ª Paella Mineira Solidária, em prol do Hospital do Câncer de Londrina.

## Product Purpose

Caixa registradora web com impressão automática de vouchers em impressora térmica. O caixa registra a venda (por exemplo, 5 unidades de um produto), confirma o pagamento e o sistema imprime um voucher por unidade vendida, com o nome do produto. Sucesso é fila curta, nenhum voucher esquecido e fechamento de caixa sem divergência.

## Positioning

Um caixa pensado para eventos beneficentes: o voucher sai sozinho, um por unidade, no momento da confirmação, e o controle de vendas por operador fecha a conta do evento. Funciona online ou em um notebook na rede local, com login e perfis.

## Operating Context

Uso em salões e quadras, às vezes com internet instável. O servidor roda em um notebook na rede local ou hospedado online. Impressora térmica de 58 ou 80 mm como padrão do Windows, impressão direta pelo Chrome em modo silencioso. Vários caixas ao mesmo tempo, cada um com seu login. Atalhos de teclado: F1 Caixa, F2 busca, F3 Vendas, F4 Produtos, F9 confirmar, Alt+1/2/3 forma de pagamento, busca com quantidade ("5 paella" + Enter).

## Capabilities and Constraints

- Perfis: administrador (produtos, equipe, vendas de todos, ajustes, CSV) e caixa (vende, reimprime, vê as próprias vendas do dia).
- Formas de pagamento: dinheiro (com troco), Pix e cartão. Pix e cartão não integram gateway; só registram a forma.
- Ajustes editáveis: nome do evento, "em prol de", organização, largura do papel (58 ou 80 mm) e altura do voucher. Cores e logo NÃO são editáveis pela interface; a identidade é fixa no sistema.
- Estoque, estorno de venda, backup e HTTPS ainda não existem.
- Terminologia: caixa, voucher, venda, produto, equipe, troco.

## Brand Commitments

Evento atual: Paella Mineira Solidária (o sistema serve a todas as edições, sem número de edição na interface), em prol do Hospital do Câncer de Londrina, organização Maçonaria do Paraná. Paleta aprovada pelo usuário: vinho escuro, laranja de destaque e creme, em tema escuro. Tom pedido: moderno, bonito e sério, profissional, sem cara de interface gerada por IA. Não usar emojis nem travessão em textos. Não copiar emblemas de instituições.

## Evidence on Hand

Flyers da 5ª edição (vinho/marrom e laranja, "PAELLA MINEIRA" em caixa alta pesada com "solidária" em script). Prompts de fotografia preparados para o Gemini em `prompts-gemini.md` (painel do login, versão larga e foto de produto); as fotos foram geradas e a logo oficial foi aplicada em PNG com fundo transparente. Não há logo em vetor, depoimentos nem números de venda reais.

## Product Principles

1. O balcão manda: velocidade e clareza antes de qualquer expressão visual.
2. Nada que exija aprender: rótulos em português claro, alvos grandes, sem jargão.
3. Cada venda é auditável: quem vendeu, quando, quanto, e se o voucher saiu.
4. Sóbrio e confiável: o sistema lida com dinheiro de uma causa, então a aparência transmite seriedade.
5. Identidade fixa e cuidada, não configurável pelo usuário.

## Accessibility & Inclusion

Público mais velho: texto grande (mínimo 16px, rótulos importantes 18px ou mais), contraste mínimo 4,5:1, foco visível, alvos de toque de 48px ou mais, nunca depender só de cor, respeitar prefers-reduced-motion, operação completa por teclado.
