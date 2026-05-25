# Definicao de Arquitetura

## Visao Geral

O CatDog funciona como uma aplicacao web Next.js com App Router. A arquitetura separa interface publica, area administrativa, rotas de API, validacoes e persistencia local em arquivo JSON.

A implementacao atual foi criada para funcionar localmente sem depender de credenciais externas. O video da atividade mostra uma evolucao com servicos externos, como banco/servico gerenciado, mas neste repositorio a persistencia ativa esta em `data/catdog-db.json`.

## Separacao por Camadas

### Front-end

Implementado com Next.js, React, TypeScript e CSS global. Responsavel por apresentar os animais, permitir filtros, abrir solicitacao de adocao e disponibilizar telas administrativas.

### Back-end/API

Implementado dentro do proprio Next.js por meio de Server Components, Server Actions e rota de API em `src/app/api/adoption-requests/route.ts`. Essa camada registra solicitacoes, valida entradas e atualiza status quando necessario.

### Persistencia

Implementada localmente em `data/catdog-db.json`, acessada por funcoes de leitura e escrita em `src/lib/store.ts`. Essa escolha permite executar o projeto sem Supabase ou banco externo.

## Fluxo de Dados Esperado

1. A rota `/animais` carrega os dados via `listCatalog`.
2. `src/lib/store.ts` le o arquivo `data/catdog-db.json`.
3. A interface exibe cards de animais e filtros client-side.
4. O usuario envia uma solicitacao de adocao pela rota `/api/adoption-requests`.
5. A API valida os dados com Zod e grava a solicitacao.
6. A area administrativa usa Server Actions para criar, atualizar e remover registros.

## Principais Modulos ou Pastas Identificadas

- `src/app/animais`: catalogo publico de animais.
- `src/app/admin`: area administrativa.
- `src/app/api/adoption-requests`: API para solicitacoes de adocao.
- `src/components`: componentes reutilizaveis de catalogo e formularios.
- `src/lib`: tipos, validacoes, autenticacao simples e persistencia.
- `data/catdog-db.json`: dados locais da aplicacao.
- `docs/context`: documentos de contexto do produto CatDog.

## Responsabilidades de Cada Camada

- Interface: apresentar dados de forma clara, acessivel e consistente.
- API e Server Actions: fornecer dados confiaveis, aplicar validacoes e executar mutacoes.
- Persistencia: armazenar informacoes dos animais e solicitacoes no arquivo JSON local.
- Documentacao: registrar decisoes, escopo, termos, restricoes e contexto de gestao para orientar o time.

## Observacoes Sobre Arquitetura Atual

- A arquitetura atual e monolitica em Next.js, suficiente para a primeira versao local.
- A autenticacao administrativa e simples, baseada em cookie e credenciais de ambiente.
- O arquivo JSON local nao substitui banco de dados real em producao.
- A documentacao atual deve ser usada como base inicial, nao como substituto de uma Spec SDD.
- No video da atividade aparecem ferramentas e uma implementacao de aula com servicos externos. Esses itens podem orientar evolucao, mas a versao atual do repositorio esta pronta para execucao local.

## Possiveis Evolucoes

- Substituir persistencia JSON por Supabase ou outro banco real.
- Criar autenticacao robusta com provedor dedicado.
- Adicionar testes automatizados para validacoes e fluxos principais.
- Criar regras mais completas de transicao de status.
- Adicionar upload real de imagens.
