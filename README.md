# CatDog

CatDog e uma plataforma simples de adocao de animais. A aplicacao permite listar animais disponiveis, filtrar por caracteristicas, registrar solicitacoes de adocao e gerenciar dados basicos em uma area administrativa.

## Stack

- Next.js com App Router
- React
- TypeScript
- CSS global
- Zod para validacoes
- Supabase preparado para persistencia real
- ESLint

## Como Rodar

Instale as dependencias:

```bash
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse:

```text
http://localhost:3000
```

## Acesso Administrativo

Valores padrao para ambiente local:

```text
E-mail: admin@catdog.local
Senha: admin123
```

Os valores de ambiente ficam no arquivo `.env`.

## Variaveis de Ambiente

O projeto usa Supabase como fonte de dados. Configure:

```text
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=SUA_PUBLISHABLE_KEY
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_ANON_PUBLIC_KEY
SUPABASE_SERVICE_ROLE_KEY=
```

Com a publishable key ou a anon public key, o app consegue fazer leitura publica e registrar solicitacoes de adocao se as policies do `supabase/schema.sql` forem aplicadas. Para CRUD administrativo direto no Supabase, preencha tambem `SUPABASE_SERVICE_ROLE_KEY`.

## Rotas Principais

- `/animais`: listagem publica de animais para adocao.
- `/login`: entrada da area administrativa.
- `/admin`: dashboard administrativo.
- `/admin/animais`: cadastro e gerenciamento de animais.
- `/admin/especies`: gerenciamento de especies.
- `/admin/racas`: gerenciamento de racas.
- `/admin/portes`: gerenciamento de portes.
- `/admin/solicitacoes`: acompanhamento de solicitacoes de adocao.

## Observacao Sobre Supabase

O projeto ja esta pronto para receber credenciais do Supabase. Quando o projeto Supabase for criado:

1. Abra o SQL Editor no Supabase.
2. Execute `supabase/schema.sql`.
3. Execute `supabase/seed.sql`.
4. Preencha `.env` com URL, publishable key e, para CRUD admin, service role key.
5. Rode `npm run dev`.

Sem credenciais validas, o app nao consegue carregar os dados do Supabase.

## Makuco

O script abaixo segue o comando do video:

```bash
npm run makuco:init
```

O pacote `https://package.makuco.com.br/makuco/latest.tgz` pode exigir acesso autenticado. Se retornar `403 Forbidden`, sera necessario liberar acesso/token na conta usada pelo npm.
