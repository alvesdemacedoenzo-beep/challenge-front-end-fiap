# Publicar o front-end na Vercel

## Publicacao atual

Site: https://soul-up-plum.vercel.app

Projeto `soul-up`, no espaco `alveesdev`, conectado ao fork `ViniciosAlvees/challenge-front-end-fiap`. Atualizacoes da branch `main` geram publicacoes automaticas. O repositorio original da equipe fica disponivel como remoto `upstream`; `origin` aponta para o fork pessoal.

Para usar a publicacao automatica, envie as alteracoes ao fork e incorpore-as a `main`. Como alternativa, publique os arquivos locais pelo CLI:

```bash
npx vercel login
npx vercel deploy --prod --scope alveesdev
```

Em outro checkout, execute antes `npx vercel link --project soul-up --scope alveesdev` para selecionar o projeto existente. A pasta `.vercel` guarda esse vinculo local e fica fora do Git.

## Publicacao assistida

Habilite a integracao Vercel nesta conversa. Depois disso, e possivel verificar sua conta, localizar um projeto existente e publicar a versao corrigida, sem precisar enviar senhas pelo chat. As configuracoes das APIs no Render sao feitas separadamente.

## Pelo painel da Vercel

1. Entre em https://vercel.com/dashboard com sua conta.
2. Antes de importar, envie o codigo corrigido ao GitHub e confirme a branch que sera publicada. A Vercel publica o codigo remoto; mudancas apenas no VS Code nao entram em um deploy pelo GitHub.
3. Se o projeto ja existir no painel, abra-o e confira o repositorio e a branch. Para um projeto novo na conta ViniciosAlvees, clique em **Add New > Project**, importe o fork `ViniciosAlvees/challenge-front-end-fiap` e selecione a branch com as correcoes.
4. Use **Framework Preset: Vite**, **Root Directory: raiz do projeto**, **Build Command: npm run build**, **Output Directory: dist** e **Install Command: npm ci**. O `vercel.json` ja declara esses valores.
5. Use `VITE_API_BASE_URL=/api` para Python e `VITE_JAVA_API_BASE_URL=/api/java` para Java. A aplicacao ja usa esses valores por padrao. Remova ou atualize valores antigos no painel antes do build. `/api/auth/*` e `/api/acesso-funcionario` usam funcoes Node para adaptar o token Bearer do Python a cookies HttpOnly. `/api/java/*` encaminha ao Java e as demais rotas `/api/*` ao Python. Configure `SOULUP_PYTHON_API_URL` no servidor se o endereco da autenticacao mudar.
6. Clique em **Deploy**. Quando o status for **Ready**, clique em **Visit** e copie a URL exibida em **Domains**. Essa sera a URL real do front-end; ela nao deve ser deduzida a partir do nome do repositorio.
7. Em um projeto ja publicado, voce encontra a URL em **Dashboard > projeto > Domains**, ou abrindo a implantacao de producao mais recente e clicando em **Visit**.
8. Cole a URL em **Como Usar** no README e confira se o site abre em uma janela anonima. As paginas de funcionarios continuam exigindo a senha configurada.

## Variaveis e API

- A senha compartilhada de funcionarios e validada no Python, em `POST /auth/funcionarios`, e configurada no Render pela variavel `SOULUP_SENHA_FUNCIONARIOS`. A senha `12345678` foi confirmada na API em 04/11/2026. A antiga senha local de nove digitos e `EMPLOYEE_PASSWORD` nao sao mais usados. O token fica em cookie HttpOnly e o logout o revoga no Python.
- Python (`https://soulup-api-python.onrender.com`) atende cadastro de conta, autenticacao e consulta de desafios. Java (`https://challeng-sprin4-java.onrender.com`) atende usuarios e grupos. Os cadastros dos dois bancos nao sao sincronizados pelo frontend.
- No Render do Python, configure `SOULUP_ORIGENS` para incluir a URL publica real do frontend e `http://localhost:5173`, sem barra final, no formato aceito pela API. Os proxies padrao mantem as chamadas do navegador na mesma origem.
- `SOULUP_JAVA_API_URL` configura o destino das consultas Java feitas pelo servidor de funcionarios. `SOULUP_API_URL` continua aceito como nome antigo dessa variavel. Os destinos dos rewrites da Vercel sao alterados no `vercel.json`.
- O patch em `backend-patches/` e historico e pode ser necessario para persistencia de membros no Java; o login do site usa a API Python.

## Conferencia online

Abra `/`, `/grupos`, um detalhe de grupo valido, uma URL inexistente e `/acesso-funcionario`. Confira as consultas Java, senha incorreta, senha correta e encerramento da sessao de funcionario. Valide cadastro, login, recarga e logout do usuario no Python e a persistencia de membros no Java. Execute `npm run check:api` para verificar as duas APIs sem criar registros. Inspecione tambem as telas em celular, tablet e desktop.

Documentacao oficial: https://vercel.com/docs/git e https://vite.dev/guide/static-deploy#vercel.
