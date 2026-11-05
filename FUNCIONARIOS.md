# Acesso Funcionário

Execute `npm install` e `npm run dev`, depois abra `/acesso-funcionario` ou use o link **Acesso Funcionário** do menu.

O desenvolvimento usa a porta fixa `5173`. Mantenha o processo do Vite em execução ao usar `http://localhost:5173`; se a porta já estiver ocupada, o Vite avisa em vez de abrir outra porta silenciosamente. Uma aba aberta não mantém o servidor ativo. Após reiniciar o servidor ou atualizar o código, recarregue a página. Falhas de conexão são informadas separadamente de credenciais incorretas e não provocam repetição automática do login.

`output/` e arquivos ZIP ficam fora do monitoramento do Vite. Isso evita que o bloqueio temporário do pacote pelo Windows/OneDrive derrube o servidor com erro `EBUSY` durante `npm run package:delivery`.

A senha compartilhada é definida em `SOULUP_SENHA_FUNCIONARIOS` no serviço Python do Render. Em 04/11/2026, `12345678` foi aceita pela API publicada. A tela envia a senha ao servidor Node, que chama `POST /auth/funcionarios` no Python e confirma o perfil em `GET /auth/me`. O token Bearer fica em cookie HttpOnly por até uma hora; não é exposto ao JavaScript do navegador. `/gestao` exige essa mesma sessão e o botão de saída revoga o token no Python.

A antiga validação Node de `123456789` foi removida. Erros de conexão/configuração do Python são apresentados como indisponibilidade, sem aceitar senha local nem informar senha incorreta quando o serviço não respondeu.

As sete ferramentas são:

1. Consultar usuários da API Java, com indicação de erro quando o serviço não responde.
2. Criar desafios na API Java com título, descrição, categoria e pontuação inteira de 1 a 10000, confirmando o registro por nova consulta.
3. Listar, editar e excluir desafios na API Java. Exclusão exige confirmação e nova consulta ao servidor.
4. Consultar as ações publicadas em **Desafios**, suas evidências, fotos, status e pareceres.
5. Aprovar/rejeitar ações pendentes com parecer de pelo menos 5 caracteres. Cada ação pode ser analisada uma única vez.
6. Consultar o ranking local, somando os pontos das ações aprovadas.
7. Consultar/excluir grupos, com confirmação pelo nome e ID, bloqueio durante o envio e nova consulta para confirmar a remoção.

A opção **Consultar/excluir grupos** está no painel de funcionários e a exclusão também está disponível na seção **Grupos** de `/gestao`. O servidor confirma a sessão e o perfil `funcionario` no Python antes de encaminhar `DELETE /grupos?id=...` ao Java. A exclusão usa `/api/acesso-funcionario?recurso=grupos&id=...`, preservando a sessão do funcionário; o proxy público `/api/java/grupos` recusa `DELETE`. A listagem e o cadastro públicos continuam disponíveis.

Essa proteção vale para os endpoints deste site. O serviço Java externo precisa aplicar autorização no próprio `DELETE /grupos` para impedir chamadas diretas à sua URL pública; este repositório não contém o código desse serviço e esta alteração não modifica sua implantação.

O link **Consultar e gerenciar cadastros da API** abre `/gestao`, com cadastro/edição/exclusão de usuários Java, cadastro/listagem/exclusão de grupos e CRUD de desafios. O formulário de usuário Java pede nome, e-mail e senha no cadastro; na edição altera nome/e-mail, conforme o PUT disponível. A senha e o saldo não são alterados por esse PUT.

Para experimentar o fluxo de participação, entre em uma conta Python na página **Conta**, selecione um desafio consultado no Java e envie uma ação. Acesse a área de funcionários no mesmo navegador para analisá-la. Cada conta pode enviar uma ação por desafio Java. A aprovação libera pontos locais no perfil/ranking, mantendo os valores da evidência mesmo se o catálogo mudar. Ações antigas locais permanecem no histórico e não são confundidas com desafios Java de mesmo ID.

## Armazenamento e integração

O catálogo e o CRUD de desafios usam Java tanto na gestão quanto na página pública. A API Python HTTP atende contas e autenticação. Ações, fotos, pareceres e ranking continuam no `localStorage`, sem sincronização entre dispositivos. As fotos aceitas são JPG, PNG, WebP e GIF de até 2 MB, sujeitas à capacidade de armazenamento do navegador. O ranking não altera pontos nas APIs. Ainda não há votação comunitária no site.

A senha protege as telas de funcionários e a consulta de usuários por seu endpoint. Os registros locais são dados de demonstração e podem ser alterados pelas ferramentas do navegador; controle de integridade entre usuários/dispositivos exige armazenamento e autorização no backend.

O endpoint `/api/acesso-funcionario` é atendido pelo middleware local no Vite (desenvolvimento e preview) e pela função `api/acesso-funcionario.js` na Vercel. O login de conta usa a adaptação equivalente em `/api/auth/*`, com cookie separado. `/api/java/*` encaminha ao Java; os demais endpoints `/api/*` encaminham ao Python.

A senha deve ser alterada somente no Python (`SOULUP_SENHA_FUNCIONARIOS`), sem prefixo `VITE_`. `EMPLOYEE_PASSWORD` não é mais utilizado. `SOULUP_PYTHON_API_URL` configura o destino da autenticação; `SOULUP_JAVA_API_URL` configura a consulta de usuários Java e `SOULUP_API_URL` permanece como nome antigo deste último. Reinicie o Vite após mudanças locais e publique uma nova versão da Vercel para atualizar o site online.

## Verificação

`npm run build` verifica os tipos e gera a versão de produção. `npm test` executa os testes de autenticação e das regras locais usando o test runner nativo do Node.js 22.18+ ou 24+.
