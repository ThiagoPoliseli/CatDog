# Definicao de Arquitetura

## Visao Geral

O CatDog funciona como uma aplicacao web Next.js com App Router. A arquitetura separa interface publica, area administrativa, rotas de API, validacoes e camada de persistencia.

A implementacao atual usa Supabase como fonte de dados e depende de credenciais validas no arquivo `.env`.

## Separacao por Camadas

### Front-end

Implementado com Next.js, React, TypeScript e CSS global. Responsavel por apresentar os animais, permitir filtros, abrir solicitacao de adocao e disponibilizar telas administrativas.

### Back-end/API

Implementado dentro do proprio Next.js por meio de Server Components, Server Actions e rota de API em `src/app/api/adoption-requests/route.ts`. Essa camada registra solicitacoes, valida entradas e atualiza status quando necessario.

### Persistencia

Implementada por uma camada em `src/lib/store.ts`, que delega leitura e escrita para `src/lib/supabase-store.ts`. Os dados ficam nas tabelas do Supabase descritas em `supabase/schema.sql`.

## Fluxo de Dados Esperado

1. A rota `/animais` carrega os dados via `listCatalog`.
2. `src/lib/store.ts` chama a camada Supabase para buscar especies, racas, portes, animais e solicitacoes.
3. A interface exibe cards de animais e filtros client-side.
4. O usuario envia uma solicitacao de adocao pela rota `/api/adoption-requests`.
5. A API valida os dados com Zod e grava a solicitacao.
6. A area administrativa usa Server Actions para criar, atualizar e remover registros.

## Principais Modulos ou Pastas Identificadas

- `src/app/animais`: catalogo publico de animais.
- `src/app/admin`: area administrativa (CRUD de animais, especies, racas, portes e solicitacoes).
- `src/app/entrar`, `src/app/cadastro`, `src/app/redefinir-senha`: paginas de autenticacao.
- `src/app/minhas-solicitacoes`: pagina do usuario para acompanhar seus pedidos de adocao.
- `src/app/api/adoption-requests`: API para registrar solicitacoes de adocao.
- `src/app/api/auth/sign-up`: API para criacao de conta sem confirmacao de e-mail.
- `src/app/auth/callback`: callback OAuth do Supabase.
- `middleware.ts`: protecao de rotas via Supabase Auth (SSR).
- `src/components`: componentes reutilizaveis de catalogo e formularios.
- `src/lib`: tipos, validacoes, guard de admin e persistencia Supabase.
- `supabase/schema.sql`: schema do banco Supabase.
- `supabase/add-user-auth.sql`: migracao que adiciona user_id na tabela adoption_requests.
- `supabase/seed.sql`: dados iniciais para Supabase.
- `docs/context`: documentos de contexto do produto CatDog.

## Responsabilidades de Cada Camada

- Interface: apresentar dados de forma clara, acessivel e consistente.
- API e Server Actions: fornecer dados confiaveis, aplicar validacoes e executar mutacoes.
- Persistencia: armazenar informacoes dos animais e solicitacoes no Supabase.
- Documentacao: registrar decisoes, escopo, termos, restricoes e contexto de gestao para orientar o time.

## Observacoes Sobre Arquitetura Atual

- A arquitetura atual e monolitica em Next.js, suficiente para a primeira versao local.
- A autenticacao e feita via Supabase Auth (JWT armazenado em cookies SSR). O acesso admin e controlado por lista de e-mails em `ADMIN_EMAIL` (env), verificada em `src/lib/admin.ts`.
- Supabase e a fonte unica de dados nesta versao; sem credenciais validas, a aplicacao nao carrega o catalogo.
- O schema do Supabase inclui triggers para bloquear solicitacoes de animais adotados e mover animais disponiveis para `in_process` quando uma solicitacao e criada.
- O init do Makuco foi mapeado em script, mas o pacote retornou `403 Forbidden` sem acesso autenticado.
- A documentacao atual deve ser usada como base inicial, nao como substituto de uma Spec SDD.
- No video da atividade aparecem ferramentas e uma implementacao de aula com servicos externos. Esses itens orientaram a evolucao da versao atual com Supabase.

## Possiveis Evolucoes

- Revisar regras de Row Level Security antes de publicar em ambiente compartilhado.
- Criar autenticacao robusta com provedor dedicado.
- Adicionar testes automatizados para validacoes e fluxos principais.
- Criar regras mais completas de transicao de status.
- Adicionar upload real de imagens.
