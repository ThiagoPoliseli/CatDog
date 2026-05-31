# Restricoes Tecnicas

## Restricoes Gerais

- O produto deve manter dados de animais consistentes e compreensiveis.
- Campos obrigatorios devem ser definidos antes da implementacao final.
- O status de adocao deve seguir valores padronizados.
- Dados incompletos ou inconsistentes nao devem ser exibidos de forma confusa para o usuario.
- Erros tecnicos nao devem ser expostos ao usuario final com mensagens internas, stack traces ou detalhes de infraestrutura.

## Validacoes Necessarias

Campos recomendados para validacao:

- nome do animal;
- especie;
- raca;
- idade;
- porte;
- descricao;
- status de adocao;
- imagem, caso o produto permita cadastro ou upload.

Validacoes esperadas:

- Nome nao deve ser vazio.
- Especie deve usar valores padronizados, como cao ou gato.
- Porte deve usar valores padronizados, como pequeno, medio ou grande.
- Status de adocao deve usar uma lista controlada de valores.
- Idade deve ser coerente e nao deve aceitar valores negativos.
- Descricao deve evitar texto vazio quando for essencial para apresentacao do animal.

## Padronizacao de Campos

Para evitar inconsistencias, o projeto deve padronizar:

- nomes dos campos;
- idioma dos valores exibidos;
- formatos de status;
- formatos de idade;
- formatos de imagem;
- representacao de raca desconhecida ou sem raca definida.

## Restricoes para Imagem de Animal

Caso o produto permita cadastro ou gerenciamento de imagens, devem ser consideradas as seguintes restricoes:

- aceitar apenas formatos seguros e comuns, como JPG, PNG ou WebP;
- limitar tamanho maximo do arquivo;
- definir imagem padrao quando nao houver foto;
- evitar imagens quebradas na interface;
- validar URLs externas, caso sejam usadas;
- garantir texto alternativo ou descricao acessivel quando possivel.

## Regras para Status de Adocao

Valores recomendados:

- disponivel;
- em processo;
- adotado.

Regras esperadas:

- Animal adotado nao deve aparecer como disponivel para nova adocao.
- Animal em processo deve indicar que ja existe andamento com potencial adotante.
- Mudancas de status devem ser controladas quando houver area administrativa.
- A interface deve deixar o status claro para evitar expectativas incorretas.

## Regras para Solicitacao de Adocao

Caso o produto registre solicitacoes ou manifestacoes de interesse, devem ser consideradas as seguintes restricoes:

- uma solicitacao deve estar vinculada a um animal existente;
- dados minimos do interessado devem ser definidos antes da implementacao;
- uma solicitacao nao deve concluir automaticamente uma adocao sem regra da organizacao;
- solicitacoes para animais adotados devem ser bloqueadas ou claramente impedidas;
- etapas da solicitacao devem usar valores padronizados, caso esse controle exista.
- O schema do Supabase reforca essa regra com trigger para impedir solicitacoes de animais adotados e atualizar animal disponivel para `in_process` apos uma nova solicitacao.

## Validacao no Front-end e Back-end

- Front-end usa campos obrigatorios, tipos de input e estados de interface para reduzir entradas incorretas.
- Back-end/API e Server Actions validam dados com Zod antes de gravar.
- Supabase deve ser usado com `SUPABASE_SERVICE_ROLE_KEY` apenas no servidor para operacoes administrativas.
- Chaves sensiveis nao devem ser expostas em componentes client-side.

## Cuidados com Erros

- Mensagens de erro devem ser amigaveis e orientadas a acao.
- Erros tecnicos devem ser registrados para diagnostico, mas nao exibidos em detalhe ao usuario final.
- Falhas de carregamento devem informar que os animais nao puderam ser carregados no momento.
- Estados vazios devem explicar que nao ha animais disponiveis ou cadastrados, sem parecer falha do sistema.

## Limitacoes Atuais Identificadas

- Supabase e a fonte unica de dados e depende de credenciais reais e execucao de `supabase/schema.sql` e `supabase/seed.sql`.
- As operacoes administrativas no Supabase usam chamadas granulares, mas dependem de `SUPABASE_SERVICE_ROLE_KEY`.
- A autenticacao administrativa e simples e adequada apenas para ambiente local/didatico.
- Imagens usam URL externa; upload de imagem ainda nao foi implementado.
- Testes automatizados ainda nao foram implementados.
- Makuco nao foi inicializado porque o pacote externo retornou `403 Forbidden`.

Essas limitacoes devem ser revistas antes de publicar o produto em ambiente de producao.
