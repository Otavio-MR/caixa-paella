# Como publicar a demonstração no Render

O projeto já está pronto para hospedar: tem `Dockerfile`, `render.yaml` e um modo de demonstração que cria os usuários e dados de exemplo sozinho.

## 1. Enviar o código para o GitHub

Crie um repositório **privado** vazio no GitHub (por exemplo `caixa-paella`) e, na pasta `Caixa`, rode:

```bash
git init
git add .
git commit -m "Caixa Paella Mineira Solidária"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/caixa-paella.git
git push -u origin main
```

O `.gitignore` já deixa de fora `node_modules`, `data` e as capturas de revisão.

## 2. Criar o serviço no Render

1. Entre em https://dashboard.render.com e crie uma conta (pode ser com o GitHub).
2. Clique em **New** e depois **Blueprint**, e escolha o repositório.
3. O Render lê o `render.yaml` e pede duas senhas. Invente senhas fortes:
   - `DEMO_ADMIN_PASSWORD`: senha do usuário `admin`
   - `DEMO_CAIXA_PASSWORD`: senha do usuário `caixa`
4. Clique em **Apply**. A primeira publicação leva de 3 a 5 minutos.
5. O link sai no formato `https://caixa-demo.onrender.com`.

## 3. Como o cliente entra

| Usuário | Perfil | Senha |
|---|---|---|
| `admin` | Administrador (produtos, equipe, vendas, ajustes) | a que você definiu em `DEMO_ADMIN_PASSWORD` |
| `caixa` | Caixa (vende e reimprime) | a que você definiu em `DEMO_CAIXA_PASSWORD` |

Já existem 5 produtos e 11 vendas de exemplo, para as telas aparecerem preenchidas.

## 4. Limites do plano gratuito

- O serviço **dorme após 15 minutos sem uso**. O primeiro acesso depois disso demora cerca de 1 minuto.
- Os dados e as fotos enviadas **somem quando o serviço reinicia**. A demonstração se recria sozinha, com os mesmos produtos e vendas.
- Para uso real no evento: troque para um plano pago com disco persistente apontando para `/app/data` e apague as duas variáveis `DEMO_...`. Aí o sistema volta a pedir a criação do administrador no primeiro acesso.

## 5. Impressão

Com o sistema online, a impressão direta continua precisando do Chrome em modo silencioso no computador do caixa:

```
Abrir Caixa.bat https://caixa-demo.onrender.com
```

Na demonstração, sem a impressora, o navegador abre a janela de impressão normal e dá para salvar o voucher em PDF.

## Cuidados

- Depois da demonstração, apague o serviço ou as variáveis `DEMO_...`.
- Nunca coloque as senhas dentro do código ou do repositório. Elas ficam só no painel do Render.
- O Dockerfile não foi testado aqui (não há Docker neste computador). O servidor foi testado localmente no modo de demonstração.
