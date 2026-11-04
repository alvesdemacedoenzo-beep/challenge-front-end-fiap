# Conferência da entrega 4 de Front-End

Revisão em **04/11/2026**, baseada nas páginas **75 a 92** do enunciado `1TDS Fevereiro - Challenge 2026 - 2º Semestre.pdf`. As páginas de penalidades (89 a 91) foram lidas e conferidas visualmente. O escopo é Front-End Design Engineering; esta revisão não certifica as outras disciplinas.

**A entrega ainda tem pendências.** Execução local aprovada, mas integração Java publicada falhou e falta vídeo. Não é possível garantir nota ou disponibilidade futura dos serviços externos.

## Pendências prioritárias

1. **Restabelecer Java e banco — responsável pelo backend.** `https://soul-up-plum.vercel.app/api/java/grupos` retornou HTTP **503**: `Servico indisponivel. Verifique a configuracao do servidor e a migracao do banco.` Consultas diretas de usuários e grupos também excederam 45 segundos inicialmente. A raiz Java respondeu 404 posteriormente, o que apenas comprova resposta do servidor. Conferir logs, configuração e migração; validar GET, detalhe e escrita persistida. Python não substitui Java neste requisito.
2. **Publicar vídeo YouTube de até 3 minutos e inserir o link em “Como Usar” no README.** A ausência compromete vídeo (5 pontos) e link na documentação (0,5 ponto); não é multa separada na tabela de penalidades.
3. **Reforçar contribuição relevante de Bryan.** Há 5 commits dele em HEAD, mas 1 é merge e 4 são alterações de conteúdo. Para reduzir dúvida na avaliação, ele deve realizar pessoalmente outra contribuição útil. Não criar commits vazios nem atribuir trabalho alheio a ele.
4. **Publicar esta revisão e sincronizar GitHub, Vercel e ZIP.** As correções desta revisão são organizadas em commits na branch `ViniciosAlveees`. A integração à branch `main` e a publicação na Vercel continuam pendentes; não houve deploy nesta revisão.
5. **Regenerar o ZIP após alterações**, principalmente após inserir o vídeo. Anexar o pacote final exclusivamente ao Portal do Aluno, dentro do prazo da disciplina.

## Todas as penalidades

Valores do enunciado; não somar como previsão de nota. A inacessibilidade do repositório aparece em duas páginas e foi preservada nos dois registros.

| Página | Infração | Penalidade | Conferência e ação necessária |
|---|---|---|---|
| 89 | ZIP maior que 50 MB | −10 pontos | Pacote abaixo de 2 MB. Gerador rejeita mais de 50.000.000 bytes. |
| 89 | Somente link do repositório, sem ZIP no portal | −15 pontos | ZIP gerado em `output/Soul-Up-Entrega-4.zip`. Equipe precisa anexá-lo ao portal. |
| 89 | ZIP corrompido, vazio ou impossível de abrir | −20 pontos | ZIP aberto e extraído em pasta limpa; instalação, testes e build executados na extração. |
| 89 | Enviar pasta node_modules | −10 pontos | Excluída do ZIP; conteúdo conferido. Não compactar a pasta inteira manualmente. |
| 89 | Faltarem arquivos essenciais | −15 pontos | Incluídos src, public, package.json, lockfile, configurações, README, servidor e função. Tailwind 4 configurado no Vite e CSS de entrada. |
| 89 | Não executar após instalar dependências | −20 pontos | npm ci, testes e build passaram na extração. Preview local funcionou. Recursos remotos dependem das APIs. |
| 89 | Repositório privado/inacessível para conferir histórico | −10 pontos | Equipe e fork responderam HTTP 200 sem autenticação. Manter públicos. |
| 89 | Entrega por canal não autorizado | −10 pontos | Equipe deve usar exclusivamente o Portal do Aluno. |
| 90 | Repositório privado/inacessível na correção | −10 pontos | Público em 04/11/2026; acesso futuro precisa ser mantido. |
| 90 | Sem histórico Git verificável | −10 pontos | 101 commits na base revisada `62482b4`; cinco integrantes presentes. Original nos repositórios; cópia textual no ZIP. |
| 91 | Bootstrap, Material UI, Chakra UI, jQuery ou UI similar proibida | −20 pontos | Não encontrados no código, dependências diretas ou lockfile. Interface usa Tailwind. |
| 91 | Axios ou biblioteca externa não autorizada de HTTP | −10 pontos | Não encontrados. Chamadas usam fetch nativo. |
| 91 | Template pronto da internet | Nota zero | Origem integral não pode ser certificada por inspeção local. Equipe deve confirmar autoria e compreender o código. |
| 91 | Framework diferente de React + Vite | Nota zero | React + Vite + TypeScript confirmados; sem Next, Vue, Angular ou CRA. |
| 91 | Entrega incompatível, sem stack exigida e integração API | Nota zero | Stack correta e integração implementada. Java online **pendente por 503**; precisa funcionar na avaliação. Indisponibilidade isolada não permite prever automaticamente nota zero. |
| 91 | Trabalho idêntico entre grupos ou plágio | Nota zero e ocorrência disciplinar | Trabalhos de outros grupos não disponíveis para comparação. Confirmar autoria, créditos e domínio do código. |

## Critérios técnicos além das penalidades

| Requisito | Evidência | Situação |
|---|---|---|
| React + Vite + TypeScript / SPA | package.json, roteador em src/main.tsx, Vite e build | Conferido |
| Rotas estáticas e dinâmicas | Páginas obrigatórias, /solucao/:slug, /grupos/:id e detalhe de usuários; parâmetros inválidos/inexistentes com feedback | Conferido localmente |
| Tipos básicos, union, intersection e interfaces | Serviços tipados, TeamMember combinando interfaces e estados de conta/ações | Conferido |
| Tailwind e responsividade | 18 rotas em 375, 480, 768, 992 e 1440 px: 90 combinações sem rolagem horizontal ou exceção JS; capturas mobile/tablet/desktop inspecionadas | Conferido nas telas examinadas |
| Cinco páginas obrigatórias | Home, Sobre, Integrantes, FAQ e Contato | Presentes |
| Duas páginas extras da solução | Solução, Avatar, Desafios e Grupos acessíveis pelo menu | Presentes |
| Integrantes | Nome, foto, RM, turma, LinkedIn e GitHub dos cinco | Presentes; exatidão pessoal depende da equipe |
| Vercel pública | Home e acesso direto a /grupos responderam HTTP 200 sem login | Site público; dados Java indisponíveis |
| API Java: listagem, detalhe e escrita | Serviços /api/java; CRUD de usuários/desafios e cadastro/listagem/exclusão de grupos implementados | **Pendente online** |
| Camada HTTP, tipos e feedback | Serviços organizados; loading, erro e vazio separados | Conferido no código e em simulação no navegador |
| README | Título, tecnologias, estrutura, autores, fotos/marca, instalação, contato, GitHub, API e Vercel | Vídeo pendente |
| Git/GitFlow | Branches, merges e participação dos cinco integrantes | Ressalva sobre relevância dos commits de Bryan |

## Correções e testes

- Código React, TypeScript, serviços, servidor e testes formatados com Prettier em pasta temporária, sem adicionar dependência ao projeto.
- Corrigida a sobreposição de “Comunidade” sobre “Sustentabilidade” na Home mobile; captura atualizada inspecionada.
- Removidos IDs, nomes e e-mails artificiais da consulta de usuários no servidor de funcionários. Dados inválidos recebem HTTP 502, com teste de regressão.
- A revisão inicial passou com 20 testes; a adequação posterior ao CRUD passou com **30 testes e build**. O ZIP também foi verificado por instalação limpa, testes e build.
- Preview local verificado no navegador. Menu abriu, fechou e respondeu a Escape. Contato rejeitou quatro campos vazios e validou entrada completa; continua demonstrativo, conforme informado na interface.
- Navegador com respostas simuladas verificou listagem, detalhe, inexistente, POST de grupo, nova consulta, vazio e erro 503. **Simulação não comprova persistência remota.**
- Python respondeu 200 em / e /desafios; /auth/me sem credenciais respondeu 401 esperado. Cadastro/login/logout reais não foram certificados com conta online nesta revisão.
- O catálogo de desafios e as operações de gestão usam Java. Evidências, pareceres e ranking continuam como prototipação no navegador. Contas Python e usuários Java são independentes.
- Persistência de membros e migrações Oracle não certificadas. O patch Java existente não foi aplicado em produção nesta revisão.

## Adequação aos módulos das imagens

As três imagens recebidas depois da revisão inicial foram usadas como checklist adicional. O frontend agora oferece:

- **Usuários Java:** cadastro administrativo com nome/e-mail/senha; listagem; edição de nome/e-mail; exclusão; leitura dos aliases de pontos acumulados.
- **Grupos Java:** cadastro, listagem, detalhe e exclusão, preservando os membros quando suportados pelo backend.
- **Desafios Java:** cadastro com título/descrição/pontos/categoria, listagem na página pública e no painel, edição e exclusão.

Os controllers foram conferidos no commit Java `e51f5dbcd2310d8cc912f0345fe4f1c2e93167c4`. O contrato real usa PUT na coleção com ID no JSON e DELETE com `?id=...`; as URLs `/{id}` das imagens não existem nesse código. O frontend segue o contrato real, sem repetir operações em URLs alternativas.

O PUT de usuário atual não implementa troca de senha nem edição de saldo; esses controles não são oferecidos. O cadastro/login público Python permanece separado do cadastro administrativo Java, sem replicação automática de senhas ou IDs.

Os testes verificam os JSONs, métodos HTTP, confirmação por consulta e ausência de IDs inventados. No navegador, com respostas Java simuladas, passaram cadastro/edição/exclusão de usuários/desafios, cadastro/exclusão de grupos, validação, cancelamento de exclusão, atualização da página pública, erro e lista vazia, sem rolagem horizontal em 375/480/768/992/1440 px. Também passou o fluxo de catálogo Java simulado → evidência local → aprovação local → pontos no perfil, preservando os pontos da evidência quando o catálogo muda.

Na consulta online posterior, `/usuarios`, `/grupos` e `/desafios` Java excederam o limite de 45 segundos. A simulação comprova o comportamento do frontend, mas **não certifica persistência no banco remoto**. O responsável pelo backend deve concluir essa validação antes da entrega.

## Histórico individual na base revisada 62482b4

Atualização de autenticação em 04/11/2026: a senha de funcionário é validada pelo Python em `/auth/funcionarios`. A antiga senha local de nove dígitos foi removida. `12345678` foi aceita pela API publicada; no navegador local, também passaram login real, recarga da sessão e logout. Tokens Bearer são mantidos em cookies HttpOnly distintos para conta e funcionário, com confirmação em `/auth/me` e revogação no Python. Os testes automatizados passaram para **34**. Essa validação de autenticação não certifica os CRUDs Java ou o deploy atualizado da Vercel.

Verificação posterior de conexão local: o Vite estava sem processo na porta 5173 e foi iniciado novamente. A tela trata falhas de rede sem expor `Failed to fetch`, distingue sessão expirada de indisponibilidade e só aceita confirmação explícita de autenticação. No navegador em `http://localhost:5173`, passaram falhas simuladas na consulta inicial e no login, recuperação com Python real, recarga e logout, com um único POST real de login. **38 testes e build passaram.**

Na geração do pacote com o Vite ativo, foi reproduzida a causa da queda: `EBUSY` ao monitorar `output/Soul-Up-Entrega-4.zip` no Windows. A configuração foi corrigida para ignorar `output/` e ZIPs no watcher do Vite, mantendo a porta 5173 fixa.

Aliases agrupados por integrante. Contagem não comprova, isoladamente, qualidade das contribuições.

| Integrante | Com merges | Sem merges |
|---|---:|---:|
| Vinicios | 47 | 32 |
| Victor | 21 | 15 |
| Raphael | 16 | 15 |
| Enzo | 12 | 12 |
| Bryan | 5 | 4 |

## Preparar e enviar

No repositório Git, em Windows/PowerShell:

```powershell
npm ci
npm test
npm run build
npm run check:api
npm run package:delivery
```

check:api deve encerrar sem falha após o conserto dos serviços. O gerador confere arquivos essenciais, exclusões e tamanho; não certifica vídeo nem APIs. Cria `output/Soul-Up-Entrega-4.zip`, sem .env.local, node_modules, .git, .vercel, dist ou caches. Inclui .env.example e GIT_HISTORICO.txt. Histórico textual não substitui o repositório público.

- [ ] Corrigir Java e demonstrar GET, detalhe e escrita persistida na versão publicada.
- [ ] Validar cadastro/login, recarga e logout online; membros dos grupos, se demonstrados.
- [ ] Inserir vídeo YouTube acessível de até 3 minutos no README.
- [ ] Revisar contribuição adicional útil de Bryan, feita por ele.
- [ ] Commitar/publicar esta revisão na branch usada pela Vercel e conferir site atualizado.
- [ ] Regenerar ZIP com README atualizado e manter GitHub, site, API e vídeo acessíveis durante a correção.
- [ ] Anexar ZIP no Portal do Aluno e guardar comprovante de envio no prazo.

Roteiro sugerido do vídeo: 0:00–0:25 proposta/equipe/tecnologias; 0:25–0:55 navegação/responsividade; 0:55–1:25 listagem e detalhe Java reais; 1:25–2:20 cadastro e consulta confirmando persistência; 2:20–2:50 tratamento de erro, serviços e documentação. Gravar após o backend funcionar.
