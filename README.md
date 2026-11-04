# Soul Up — sustentabilidade em comunidade

A Soul Up conecta pessoas a ações ambientais por meio de desafios, grupos e reconhecimento. Este projeto é uma SPA desenvolvida para a Entrega 4 de Front-End Design Engineering do Challenge FIAP 2026.

![Marca Soul Up](./public/icon/souldup.png)

## Tecnologias utilizadas

- React 19, Vite e TypeScript com verificação estrita de tipos.
- Tailwind CSS 4 para layout e responsividade.
- React Router DOM para rotas estáticas e dinâmicas.
- React Hook Form para o formulário de contato e de conta.
- Fetch API nativa para requisições HTTP; sem Axios ou bibliotecas externas de UI.
- Node.js para a função de acesso de funcionários e os testes automatizados.
- Git e GitHub para versionamento.

## Como Usar

### Links da entrega

| Recurso | Endereço ou situação |
|---|---|
| Repositório do front-end | [challenge-front-end-fiap](https://github.com/alvesdemacedoenzo-beep/challenge-front-end-fiap) — conferir acesso público sem login antes de entregar |
| Fork conectado à Vercel | [ViniciosAlvees/challenge-front-end-fiap](https://github.com/ViniciosAlvees/challenge-front-end-fiap) |
| Repositório Java | [challeng-sprin4-Java](https://github.com/velascoguzmanvictorhugo-ui/challeng-sprin4-Java) |
| API Java publicada | [API Soul Up](https://challeng-sprin4-java.onrender.com) |
| API Python publicada | [API Python Soul Up](https://soulup-api-python.onrender.com) |
| Deploy na Vercel | [Soul Up](https://soul-up-plum.vercel.app) |
| Vídeo no YouTube | **Pendente: gravar a demonstração de até 3 minutos e inserir o link acessível.** |

O vídeo ainda é uma pendência da entrega. A Vercel está conectada ao fork `ViniciosAlvees/challenge-front-end-fiap`; atualizações da branch `main` publicam o frontend automaticamente.

**Conferência em 04/11/2026:** o site e os repositórios estavam públicos, mas a consulta de grupos Java pelo site retornou HTTP 503, indicando configuração do servidor ou migração do banco. A integração Java precisa ser restabelecida e validada com leitura e escrita reais antes da entrega. Confira o relatório e a tabela completa de penalidades em [ENTREGA_SPRINT4.md](./ENTREGA_SPRINT4.md).

### Instalação e execução

Requisitos: Node.js 22.18+ ou 24+ e npm.

```bash
npm ci
npm run dev
```

O aplicativo usa as duas APIs: `/api` encaminha para Python e `/api/java` encaminha para Java. Os proxies funcionam no desenvolvimento, no preview e na Vercel, mantendo a sessão Python na mesma origem do site. Opcionalmente, copie `.env.example` para `.env.local`. Reinicie o Vite após alterar a configuração.

| Variável | Padrão / uso |
|---|---|
| `VITE_API_BASE_URL` | `/api`, cliente Python |
| `VITE_JAVA_API_BASE_URL` | `/api/java`, cliente Java |
| `SOULUP_PYTHON_API_URL` | `https://soulup-api-python.onrender.com`, proxy local Python |
| `SOULUP_JAVA_API_URL` | `https://challeng-sprin4-java.onrender.com`, proxy local Java e consultas de funcionários |

Na Vercel, os destinos dos proxies são declarados em `vercel.json`; alterar apenas as variáveis `SOULUP_*` não altera esses rewrites. Se houver valores antigos de `VITE_API_BASE_URL` no painel, ajuste para `/api` e defina `VITE_JAVA_API_BASE_URL=/api/java` antes do próximo build.

```bash
npm test
npm run build
npm run preview
npm run check:api
```

`npm test` verifica autenticação, roteamento entre as duas APIs, contrato HTTP, validação das respostas e regras de gestão local. `check:api` consulta Python e Java sem alterar registros nem exibir dados pessoais. O HTTP 401 de `/auth/me` sem credenciais é esperado; indisponibilidade de qualquer API faz a verificação falhar.

### Navegação e funcionalidades

- **Menu:** abre e fecha os links das páginas em qualquer resolução; fecha ao navegar ou pressionar Escape.
- **Home, Sobre, FAQ e Integrantes:** apresentação da proposta e da equipe.
- **Solução e Avatar:** conteúdo e prototipação navegável da proposta, com detalhes em `/solucao/:slug`.
- **Grupos:** listagem real da API em `/grupos`, detalhe em `/grupos/:id` e cadastro em `/grupos/novo`. O cadastro envia os IDs dos participantes e consulta novamente a API para verificar os vínculos.
- **Conta e Perfil:** cadastro e autenticação por senha. O login somente é aceito quando `/auth/login` e `/auth/me` confirmam a sessão; não existe entrada apenas por e-mail nem autenticação pelo armazenamento do navegador.
- **Acesso Funcionário:** consulta de usuários e seus detalhes, cadastro/edição/exclusão de desafios na API Java, consulta e análise local de ações e ranking local. A senha é validada pelo Python em `/auth/funcionarios`; `12345678` foi confirmada no serviço em 04/11/2026. Leia [FUNCIONARIOS.md](./FUNCIONARIOS.md).
- **Gestão da API:** cadastro, listagem, edição de nome/e-mail e exclusão de usuários Java; listagem e exclusão de grupos, com acesso ao formulário de cadastro; cadastro, listagem, edição e exclusão de desafios Java. Toda escrita é confirmada por nova consulta, e exclusões exigem confirmação do usuário.
- **Desafios:** catálogo consultado na API Java com título, descrição, categoria e pontos. Participação com descrição e foto local, sujeita à aprovação de funcionário. Os pontos locais e os pontos da API são apresentados separadamente no perfil.
- **Contato:** formulário demonstrativo com validação, sem envio de mensagens.

### Integração Python e Java

| Operação | API |
|---|---|
| Cadastro de conta (`POST /usuarios`), login, sessão e logout (`/auth/*`) | Python |
| Cadastro de usuário administrativo, listagem, detalhes, edição e exclusão (`/usuarios`) | Java |
| Listagem, detalhes, criação e exclusão de grupos (`/grupos`) | Java |
| Catálogo de desafios na página principal e gestão: GET, POST, PUT e DELETE (`/desafios`) | Java |

As contas autenticadas pelo Python e os usuários retornados pelo Java pertencem aos respectivos backends. O frontend não replica contas, senhas, IDs ou exclusões entre os bancos. Os membros de grupos são selecionados exclusivamente da listagem Java; o ID da sessão Python não é usado como ID de usuário Java. Para compartilhar cadastros entre os serviços, os backends precisam implementar essa sincronização.

O Python atual usa token Bearer. As funções Node de `/api/auth/*` e `/api/acesso-funcionario` enviam as credenciais ao Python, confirmam a sessão em `/auth/me` e guardam o token em cookies HttpOnly separados para usuário e funcionário, por até uma hora. O token não é devolvido ao JavaScript do navegador; logout revoga a sessão no Python. Não há senha local de funcionário nem fallback caso o Python recuse o acesso. Configure `SOULUP_SENHA_FUNCIONARIOS` no serviço Python do Render; `EMPLOYEE_PASSWORD` não é usado pelo frontend/Node.

O contrato foi conferido no Java em `main`, commit `e51f5dbcd2310d8cc912f0345fe4f1c2e93167c4`: `GET/POST /usuarios`, `PUT /usuarios` com `id`, `nome` e `email` no JSON; `GET/POST /grupos`; `GET/POST /desafios`, `PUT /desafios` com `id`, `titulo`, `descricao`, `pontos` e `categoria`. As exclusões usam `DELETE /usuarios?id=...`, `/grupos?id=...` e `/desafios?id=...`. Os exemplos das imagens com `/{id}` não correspondem aos controllers atuais; não há tentativa automática de repetir operações em outras URLs.

O cadastro de usuário Java envia `nome`, `email` e `senha`. Pontos são lidos em `pontosAcumulados`, `pontos_acumulados` ou `pontosAdquiridos`. O PUT atual persiste nome/e-mail; alteração de senha e edição de saldo não são oferecidas porque o backend não implementa essas operações. A página **Conta** continua usando o Python para cadastro/login, sem copiar senhas ou criar uma segunda conta automaticamente.

O POST de desafios no Java pode responder com `id: 0`, embora o banco tenha gerado outro ID. O frontend compara as listagens anterior e posterior e só confirma um único registro novo correspondente. Respostas ambíguas ou falhas de consulta exibem orientação para consultar a lista antes de repetir o cadastro.

As telas de detalhe consultam os dados atuais das listagens e selecionam o registro pelo ID. Identificadores inválidos ou inexistentes têm feedback próprio. Respostas inválidas, falhas HTTP e listas vazias são tratadas separadamente, sem fabricar registros.

O pacote histórico em [backend-patches](./backend-patches/README.md) contém correções Java para autenticação e membros. A autenticação do frontend agora usa o Python e não depende da aplicação desse patch Java. A persistência de membros continua dependendo do contrato implementado no Java.

No Render da API Python, configure `SOULUP_ORIGENS` com as origens permitidas, incluindo `http://localhost:5173` e a URL pública real do frontend, sem barra final e no formato aceito pelo backend. Essa alteração é feita no painel do Render. Com os proxies padrão, o navegador faz as requisições à própria origem do site; ao configurar URLs diretas em `VITE_*`, o backend correspondente precisa permitir CORS e cookies dessa origem.

No Java, configure `FRONTEND_ORIGINS` para incluir a origem publicada e as origens locais usadas. O filtro do cadastro verifica a origem das requisições mesmo quando o frontend usa proxy.

O catálogo de desafios é persistido pelo Java. Fotos, evidências, pareceres e ranking de demonstração continuam neste navegador, sem sincronização entre dispositivos. A evidência guarda uma cópia da descrição/pontos consultados no Java; editar ou excluir o desafio depois não altera os pontos das ações já aprovadas. IDs dos antigos desafios locais não são tratados como IDs Java. Esses dados locais não substituem persistência e autorização no backend.

## Estrutura de pastas

```text
api/                 # Função da Vercel para acesso de funcionários
backend-patches/     # Correções Java e procedimento de aplicação
public/icon/         # Marca e ícones
scripts/             # Verificação da API e preparação da entrega
server/              # Autenticação dos funcionários no servidor Node
src/
  assets/team/       # Fotos dos integrantes
  components/        # Layout, proteção e feedback reutilizáveis
  contexts/          # Sessão de usuário verificada no servidor
  hooks/             # Carregamento reutilizável de listas da API
  data/              # Conteúdo e interfaces da equipe
  pages/             # Páginas da SPA
  services/          # Integração HTTP e regras locais tipadas
tests/               # Testes automatizados
```

## Autores e créditos

Equipe **Nexus Elite**, turma **1TDSPY**, FIAP. Os dados da equipe utilizam interfaces e intersection types; estados de autenticação e ações utilizam union types.

| Integrante | RM | Foto | LinkedIn | GitHub |
|---|---|---|---|---|
| Raphael Ferreira Tavares | 569767 | ![Raphael](./src/assets/team/raphael.png) | [Perfil](https://www.linkedin.com/in/raphael-ferreira-0111323b8/) | [raph-ferreira](https://github.com/raph-ferreira) |
| Bryan Germano | 569716 | ![Bryan](./src/assets/team/bryan.png) | [Perfil](https://www.linkedin.com/in/bryan-germano-84016729b/) | [BryanGermano](https://github.com/BryanGermano) |
| Enzo Macedo | 569427 | ![Enzo](./src/assets/team/enzo.png) | [Perfil](https://www.linkedin.com/in/enzo-alves-de-macedo-408359356/) | [alvesdemacedoenzo-beep](https://github.com/alvesdemacedoenzo-beep) |
| Victor Hugo Velasco Guzman | 573173 | ![Victor](./src/assets/team/victor.png) | [Perfil](https://www.linkedin.com/in/victor-hugo-velasco-guzman-296256235/) | [velascoguzmanvictorhugo-ui](https://github.com/velascoguzmanvictorhugo-ui) |
| Vinicios Alves | 573002 | ![Vinicios](./src/assets/team/vinicios.png) | [Perfil](https://www.linkedin.com/in/vinicios-alves-dos-santos-434128327/) | [ViniciosAlvees](https://github.com/ViniciosAlvees) |

Marca e imagens de equipe fornecidas com o projeto. Houve apoio do Codex na implementação e revisão técnica; os integrantes devem revisar e compreender as alterações e registrar seu uso de IA conforme as exigências de cada disciplina.

## Contato

[soulup@gmail.com](mailto:soulup@gmail.com) e perfis profissionais dos integrantes acima.

## Preparação da entrega

Antes de enviar, publique a API corrigida e o front-end, valide o acesso público, preencha os links pendentes e revise [ENTREGA_SPRINT4.md](./ENTREGA_SPRINT4.md). O ZIP deve ter até 50 MB, incluir o código e as configurações e excluir `node_modules`, credenciais, caches e arquivos temporários. O envio deve ocorrer pelo Portal do Aluno.

Em Windows, execute `npm run package:delivery` a partir do repositório Git para gerar `output/Soul-Up-Entrega-4.zip`. O comando confere arquivos essenciais, conteúdo e limite de tamanho e inclui uma cópia textual do histórico Git. Após inserir o vídeo ou alterar o código, gere o pacote novamente. A preparação do ZIP não substitui a validação da API online nem o envio pelo portal.
