# Escopo e Contexto de Features

## Escopo do Produto

O CatDog tem como escopo principal permitir a divulgacao e consulta de animais disponiveis para adocao. A primeira versao deve priorizar a clareza das informacoes dos animais e a facilidade de navegacao para pessoas interessadas em adotar.

## Funcionalidades Dentro do Escopo

- Listagem de animais disponiveis para adocao.
- Visualizacao de informacoes principais do animal:
  - nome;
  - especie;
  - raca;
  - idade;
  - porte;
  - descricao;
  - status de adocao;
  - imagem.
- Uso de status de adocao, como disponivel, em processo ou adotado.
- Cadastro ou gerenciamento basico de animais, caso essa capacidade exista ou venha a ser prevista na estrutura do projeto.
- Filtros por nome, especie, raca, porte ou status, caso essa funcionalidade esteja presente ou seja definida para a primeira versao.
- Manifestacao de interesse ou solicitacao basica de adocao, caso esse fluxo esteja previsto no produto.
- Area administrativa simples para manutencao de animais, especies ou dados auxiliares, caso exista na implementacao.
- Organizacao dos dados para facilitar consulta por adotantes e manutencao pela organizacao.

## Funcionalidades Fora do Escopo

- Venda de animais.
- Pagamento online.
- Chat em tempo real.
- Transporte do animal.
- Integracao com clinicas veterinarias.
- Sistema financeiro da organizacao.
- Automacao completa do processo juridico ou contratual de adocao.
- Analise comportamental automatizada dos animais.

## Premissas

- O produto deve ser focado em adocao responsavel, nao em comercializacao de animais.
- As informacoes exibidas devem ser simples, objetivas e compreensiveis para o publico geral.
- Cada animal deve possuir dados minimos suficientes para consulta.
- O status de adocao deve estar sempre claro para evitar contato sobre animais indisponiveis.
- A documentacao deve ser usada como base antes da criacao de uma Spec SDD.

## Limites da Primeira Versao

- A primeira versao deve se concentrar na apresentacao e organizacao dos animais.
- Fluxos complexos de adocao, como entrevistas, aprovacoes formais, contratos e acompanhamento pos-adocao, ficam fora da primeira entrega.
- A primeira versao pode registrar interesse de adocao, mas nao deve automatizar todo o processo operacional da organizacao sem definicao previa.
- Integracoes externas nao devem ser consideradas como obrigatorias nesta etapa.
- Caso nao exista back-end ou persistencia implementada no repositorio, o uso de dados mockados ou estaticos deve ser tratado como limitacao atual ate definicao tecnica posterior.

## Principais Fluxos do Usuario

1. A pessoa acessa o CatDog.
2. A pessoa visualiza a lista de animais cadastrados ou disponiveis.
3. A pessoa consulta informacoes basicas de um animal.
4. A pessoa identifica o status de adocao do animal.
5. Caso existam filtros, a pessoa refina a busca por nome, especie, raca, porte ou status.
6. A pessoa decide se deseja seguir para um contato, manifestacao de interesse ou processo de adocao definido pela organizacao.
7. Caso exista area administrativa, uma pessoa responsavel atualiza os dados dos animais e seus status.

## Observacao Sobre o Repositorio Atual

O repositorio agora possui uma implementacao local em Next.js com catalogo publico, filtros, solicitacao de adocao e area administrativa para gerenciamento de animais, especies, racas, portes e solicitacoes. A persistencia atual e local em `data/catdog-db.json`.
