# Como publicar o Caixa online

O projeto já está pronto para hospedar: tem `Dockerfile`, `render.yaml` e um modo de demonstração que cria os usuários e dados de exemplo sozinho. Os dados ficam no **MongoDB Atlas** (permanentes). Sem o Atlas, o sistema usa um banco local (SQLite), que serve para o notebook na rede do evento, mas **se apaga quando o servidor da nuvem reinicia**.

## 1. Criar o banco no MongoDB Atlas (gratuito)

1. Entre em https://www.mongodb.com/atlas e crie uma conta.
2. Crie um cluster **gratuito (M0)**. Escolha a região mais próxima, de preferência São Paulo.
3. **Database Access** (acesso ao banco): crie um usuário e uma senha forte. Prefira uma senha só com letras e números, para não precisar codificar caracteres especiais na URL.
4. **Network Access** (acesso pela rede): adicione o IP `0.0.0.0/0` ("permitir de qualquer lugar"). O Render gratuito não tem IP fixo, então não dá para liberar só um endereço. A proteção, nesse caso, é a senha forte do passo 3.
5. Em **Connect**, escolha **Drivers** e copie a string de conexão. Ela é parecida com:
   `mongodb+srv://USUARIO:SENHA@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   Troque `<password>` (ou `SENHA`) pela senha do passo 3.

O plano gratuito tem 512 MB, o que é muito mais do que o necessário para vendas e vouchers. Ele não faz backup contínuo: exporte os dados antes de eventos importantes (Atlas, **Collections**, **Export**) e tire um registro por segurança. Clusters gratuitos podem ser pausados depois de muito tempo sem uso, e basta retomá-los no painel.

## 2. Enviar o código para o GitHub

Crie um repositório **privado** vazio no GitHub e, na pasta `Caixa`, rode:

```bash
git init
git add .
git commit -m "Caixa Paella Mineira Solidária"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/caixa-paella.git
git push -u origin main
```

O `.gitignore` já deixa de fora `node_modules`, `data` e as pastas de apoio.

## 3. Criar o serviço no Render

1. Entre em https://dashboard.render.com e crie uma conta (pode ser com o GitHub).
2. Clique em **New** e depois **Blueprint**, e escolha o repositório.
3. O Render lê o `render.yaml` e pede três valores:
   - `MONGODB_URI`: a string de conexão do passo 1.5.
   - `DEMO_ADMIN_PASSWORD` e `DEMO_CAIXA_PASSWORD`: senhas fortes dos usuários de demonstração. Para uso real, deixe estas duas em branco (veja o passo 5).
4. Clique em **Apply**. A primeira publicação leva de 3 a 5 minutos.
5. O link sai no formato `https://caixa-demo.onrender.com`.

Na primeira subida, o banco está vazio e o sistema cria os dados da demonstração (se as senhas foram informadas). Nas próximas, ele usa o que já está no Atlas.

## 4. Como o cliente entra na demonstração

| Usuário | Perfil | Senha |
|---|---|---|
| `admin` | Administrador (produtos, equipe, vendas, ajustes) | a que você definiu em `DEMO_ADMIN_PASSWORD` |
| `caixa` | Caixa (vende e reimprime) | a que você definiu em `DEMO_CAIXA_PASSWORD` |

Já existem 5 produtos e 11 vendas de exemplo, para as telas aparecerem preenchidas.

## 5. Para o evento de verdade

- Use um banco novo, ou apague as coleções da demonstração no Atlas.
- No Render, **apague** as variáveis `DEMO_ADMIN_PASSWORD` e `DEMO_CAIXA_PASSWORD`. Com o banco vazio, o sistema mostra a tela de "primeiro acesso". **Crie o administrador logo após publicar**, porque quem abrir o link primeiro vira administrador.
- O plano gratuito do Render **dorme após 15 minutos sem uso**, e o primeiro acesso depois disso demora cerca de 1 minuto. Para um evento, use um plano pago do Render, que não dorme.
- Como os dados estão no Atlas, reiniciar ou republicar o servidor **não apaga** vendas, produtos, fotos nem logins.

## 6. Notebook na rede local, sem internet

Sem a variável `MONGODB_URI`, o sistema usa o SQLite e grava na pasta `data`. Rode `Iniciar Servidor.bat` e abra o endereço que ele mostra nos outros aparelhos. É o plano B se o Wi-Fi do local for ruim.

## 7. Domínio próprio

No Render, **Settings**, **Custom Domains**, **Add Custom Domain**. Aponte o DNS como o Render indicar (CNAME para `www`, registro A ou ALIAS para o domínio sem `www`). O certificado HTTPS é automático.

## 8. Impressão

Com o sistema online, a impressão direta continua precisando do Chrome em modo silencioso no computador do caixa:

```
Abrir Caixa.bat https://caixa-demo.onrender.com
```

## Cuidados

- Nunca coloque senhas nem a `MONGODB_URI` dentro do código ou do repositório. Elas ficam só no painel do Render.
- Depois da demonstração, apague o serviço ou as variáveis `DEMO_...`.
- O Dockerfile não foi testado aqui (não há Docker neste computador).
