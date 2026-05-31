# Contexto de Stack Tecnica

## Analise Realizada

O repositorio agora possui uma aplicacao CatDog implementada com Next.js, React e TypeScript. A stack abaixo foi identificada a partir de `package.json`, arquivos de configuracao e estrutura de pastas.

## Front-end

- Next.js `16.2.6`
- React `19.2.6`
- React DOM `19.2.6`
- TypeScript `6.0.3`
- CSS global em `src/app/globals.css`
- Lucide React para icones
- `next/image` para imagens remotas otimizadas

## Back-end/API

- Server Components e Server Actions do Next.js.
- Rota de API `src/app/api/adoption-requests/route.ts`.
- Camada de persistencia e regras em `src/lib/store.ts`.
- Validacoes com Zod.

## Banco de Dados ou Persistencia

- Supabase integrado como fonte unica de dados via `@supabase/supabase-js`.
- Schema SQL em `supabase/schema.sql`.
- Seed SQL em `supabase/seed.sql`.
- Nao ha ORM nesta versao.

## Testes

- Testes automatizados ainda nao foram implementados.
- A verificacao atual e feita com `npm run lint`, `npm run typecheck`, `npm run build` e `npm audit`.

## Lint e Formatacao

- ESLint `9.39.4`
- `eslint-config-next` `16.2.6`
- Configuracao em `eslint.config.mjs`
- Prettier nao identificado no repositorio.

## Build e Execucao

Scripts definidos em `package.json`:

- `npm run dev`: inicia ambiente local.
- `npm run build`: gera build de producao.
- `npm run start`: executa build de producao.
- `npm run lint`: executa ESLint.
- `npm run typecheck`: executa TypeScript sem gerar build.
- `npm run verify`: executa lint, typecheck e build.
- `npm run makuco:init`: executa o comando de init do Makuco quando o pacote estiver acessivel.

## Qualidade e Analise Estatica

- ESLint para qualidade de codigo.

## Versionamento

O projeto usa Git. No momento desta documentacao, o branch atual `master` ainda nao possui commits.

## Referencias Visuais do Video

No video da atividade aparecem, em ambiente de aula, ferramentas e tecnologias como Node.js, VS Code, Makuco, Supabase, Next.js, React e Tailwind CSS. Nesta implementacao foram confirmados Node.js, Next.js, React, TypeScript, ESLint e Supabase como fonte de dados. Tailwind CSS nao e dependencia ativa do repositorio.

## Observacao Importante

Esta documentacao deve ser atualizada se forem adicionados testes automatizados, upload de imagens, autenticacao externa ou mudancas relevantes no schema do Supabase.
