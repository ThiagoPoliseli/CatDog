# Ferramentas Externas

## Makuco

Comando solicitado no video:

```bash
npx -y https://package.makuco.com.br/makuco/latest.tgz init
```

Tambem existe o script:

```bash
npm run makuco:init
```

Status atual: o pacote retornou `403 Forbidden` ao tentar baixar `https://package.makuco.com.br/makuco/latest.tgz`. Isso indica bloqueio de acesso ao pacote, necessidade de autenticacao ou liberacao no servidor do Makuco.

Quando o acesso estiver liberado, rode novamente o comando acima na raiz do projeto.

## Supabase

O projeto esta pronto para receber credenciais do Supabase.

Passos:

1. Criar um projeto no Supabase.
2. Abrir o SQL Editor.
3. Executar `supabase/schema.sql`.
4. Executar `supabase/seed.sql`.
5. Preencher `.env`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`, se for usar CRUD administrativo direto no banco
6. Rodar `npm run dev`.

Sem credenciais validas, o app nao consegue carregar os dados do Supabase.

Se o schema ja tiver sido executado antes de alguma alteracao neste repositorio, execute `supabase/schema.sql` novamente para atualizar policies, funcoes e triggers.
