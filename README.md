# CatDog

CatDog e uma plataforma simples de adocao de animais. A aplicacao permite listar animais disponiveis, filtrar por caracteristicas, registrar solicitacoes de adocao e gerenciar dados basicos em uma area administrativa.

## Stack

- Next.js com App Router
- React
- TypeScript
- CSS global
- Zod para validacoes
- Persistencia local em `data/catdog-db.json`
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

Voce pode sobrescrever esses valores criando um arquivo `.env.local` com base em `.env.example`.

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

O video da atividade mostra uma implementacao de aula com servicos externos. Esta versao esta preparada para funcionar localmente sem credenciais externas. Uma integracao futura com Supabase pode substituir `data/catdog-db.json` por banco real usando as variaveis em `.env.example`.
