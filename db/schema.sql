-- ====================================================================
-- App dos Sócios: banco de dados (Postgres)
-- Proposta inicial. O app só LÊ dos sistemas do escritório: este banco é
-- uma cópia organizada para o celular, mais o que é pessoal de cada sócia.
-- A fonte da verdade continua sendo o Legal One e o Log de Bloqueios.
-- O Legal One NÃO tem API no contrato: os dados entram por relatórios exportados
-- (XLSX ou HTML), lidos por lib/importar/planilha.mjs.
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. CÓPIA DOS SISTEMAS (preenchida pela sincronização, nunca pelo app)
-- --------------------------------------------------------------------

-- Organizações sociais (clientes)
create table clientes (
  id              bigint generated always as identity primary key,
  nome            text unique not null,           -- "Instituto Gnosis" (como vem no relatório)
  sigla           text,                           -- "IG"
  principal       boolean not null default false, -- aparece na grade de Organizações
  atualizado_em   timestamptz not null default now()
);

-- Contratos de gestão de cada OS com o poder público
create table contratos_gestao (
  id              bigint generated always as identity primary key,
  cliente_id      bigint not null references clientes(id),
  orgao           text not null,                  -- "Município de Niterói"
  vigencia_inicio date,
  vigencia_fim    date,
  nome_no_relatorio text,                         -- como o contrato aparece na coluna do relatório, se diferente
  atualizado_em   timestamptz not null default now(),
  unique (cliente_id, orgao)
);

-- Processos
create type area_direito as enum ('Trabalhista', 'Cível', 'Administrativo', 'Constitucional');
create type prognostico  as enum ('Provável', 'Possível', 'Remoto');

create table processos (
  id                 bigint generated always as identity primary key,
  numero_cnj         char(25) unique,             -- 0000000-00.0000.0.00.0000 (chave principal da importação)
  pasta              text unique,                 -- pasta do Legal One, quando não houver número CNJ
  cliente_id         bigint not null references clientes(id),
  contrato_id        bigint references contratos_gestao(id),
  area               area_direito not null,
  descricao          text not null,               -- "Reclamação trabalhista: verbas rescisórias"
  situacao           text not null,               -- "Em andamento", "Suspenso", "Arquivado"...
  ativo              boolean not null default true, -- não arquivado nem baixado
  valor_causa        numeric(14,2),               -- base do passivo estimado
  prognostico        prognostico,                 -- classificação do escritório
  advogado_responsavel text,
  ultima_movimentacao date,                       -- para "parado há X dias"
  atualizado_em      timestamptz not null default now()
);
create index on processos (cliente_id);
create index on processos (contrato_id);
create index on processos (ativo, area);

-- Movimentações (DataJud e/ou andamentos do Legal One)
create table movimentacoes (
  id              bigint generated always as identity primary key,
  processo_id     bigint not null references processos(id) on delete cascade,
  data_hora       timestamptz not null,
  fonte           text not null check (fonte in ('datajud', 'planilha')),
  codigo_tpu      integer,                        -- código da Tabela Processual Unificada (DataJud)
  nome            text not null,                  -- "Sentença", "Bloqueio de valores via SISBAJUD"
  complemento     text,                           -- detalhes; da planilha, o texto do último andamento
  grau            text,                           -- G1, G2...
  chave_origem    text not null,                  -- evita duplicar (data|código|grau no DataJud)
  criado_em       timestamptz not null default now(),
  unique (processo_id, fonte, chave_origem)
);
create index on movimentacoes (processo_id, data_hora desc);

-- Bloqueios judiciais (Log de Bloqueios)
create table bloqueios (
  id              bigint generated always as identity primary key,
  origem_id       text unique not null,           -- linha/identificador no Log de Bloqueios
  processo_id     bigint not null references processos(id),
  valor           numeric(14,2) not null,
  data_bloqueio   date not null,
  situacao        text not null check (situacao in ('Ativo', 'Levantado')),
  data_levantamento date,
  sistema         text not null default 'SISBAJUD',
  atualizado_em   timestamptz not null default now()
);
create index on bloqueios (processo_id);
create index on bloqueios (situacao);

-- Reclamações constitucionais (STF)
create table reclamacoes (
  id              bigint generated always as identity primary key,
  cliente_id      bigint not null references clientes(id),
  numero          text unique not null,           -- "Rcl 80.150/RJ"
  assunto         text not null,
  precedente      text,                           -- "ADPF 664"
  ato_reclamado   text,
  liminar         text check (liminar in ('Pendente', 'Deferida', 'Indeferida')),
  situacao        text not null,                  -- "Em andamento", "Julgada"
  atualizado_em   timestamptz not null default now()
);
create table reclamacao_processos (               -- processos de origem de cada reclamação
  reclamacao_id   bigint references reclamacoes(id) on delete cascade,
  processo_id     bigint references processos(id) on delete cascade,
  primary key (reclamacao_id, processo_id)
);

-- --------------------------------------------------------------------
-- 2. CONTAS CALCULADAS (o app e a IA leem daqui; ninguém digita números)
-- --------------------------------------------------------------------

-- Passivo estimado por contrato de gestão, separado por prognóstico
create view passivo_por_contrato as
select c.id as contrato_id, c.cliente_id, c.orgao,
       count(p.id)                                                         as processos,
       coalesce(sum(p.valor_causa), 0)                                     as passivo_total,
       coalesce(sum(p.valor_causa) filter (where p.prognostico = 'Provável'), 0) as provavel,
       coalesce(sum(p.valor_causa) filter (where p.prognostico = 'Possível'), 0) as possivel,
       coalesce(sum(p.valor_causa) filter (where p.prognostico = 'Remoto'), 0)   as remoto,
       (select coalesce(sum(b.valor), 0) from bloqueios b join processos p2 on p2.id = b.processo_id
         where p2.contrato_id = c.id and b.situacao = 'Ativo')             as bloqueado_ativo
from contratos_gestao c
left join processos p on p.contrato_id = c.id and p.ativo
group by c.id;

-- Fotografia do passivo no fim de cada mês, por contrato (base do gráfico "Evolução do passivo").
-- O relatório do Legal One só traz o valor de hoje: a cada importação, o mês corrente é regravado;
-- quando o mês vira, a última fotografia fica guardada. O histórico começa no dia em que o app entra no ar.
create table passivo_mensal (
  contrato_id     bigint not null references contratos_gestao(id),
  mes             date not null,                  -- primeiro dia do mês
  provavel        numeric(14,2) not null default 0,
  possivel        numeric(14,2) not null default 0,
  remoto          numeric(14,2) not null default 0,
  processos       integer not null default 0,
  gravado_em      timestamptz not null default now(),
  primary key (contrato_id, mes)
);

-- Dias sem movimentação de cada processo ativo
create view processos_parados as
select id, cliente_id, contrato_id, area, descricao,
       (current_date - ultima_movimentacao) as dias_parado
from processos where ativo;

-- --------------------------------------------------------------------
-- 3. O QUE É DE CADA SÓCIA (escrito pelo app; cada uma só vê o seu)
-- --------------------------------------------------------------------

create table usuarias (
  id              uuid primary key default gen_random_uuid(),
  entra_id        text unique not null,           -- id da conta Microsoft do escritório
  email           text unique not null,
  nome            text not null,
  apelido         text,                           -- "Dra. Vanessa", na saudação
  ativa           boolean not null default true,  -- desligar acesso sem apagar histórico
  criada_em       timestamptz not null default now()
);

create table preferencias (
  usuaria_id      uuid primary key references usuarias(id) on delete cascade,
  tamanho_texto   numeric(3,2) not null default 1,   -- 1, 1.12, 1.25
  ouvir_resumos   boolean not null default false,
  face_id         boolean not null default false,
  ordem_clientes  bigint[] not null default '{}',
  blocos_inicio   jsonb not null default '[]',       -- [{id:"resumo",visivel:true}, ...]
  avisos          jsonb not null default '{}'        -- quais notificações quer receber
);

create table seguidos (                           -- "Sigo": base da busca diária no DataJud
  usuaria_id      uuid references usuarias(id) on delete cascade,
  processo_id     bigint references processos(id) on delete cascade,
  desde           timestamptz not null default now(),
  primary key (usuaria_id, processo_id)
);

create table anotacoes (                          -- privadas: só a autora vê
  id              bigint generated always as identity primary key,
  usuaria_id      uuid not null references usuarias(id) on delete cascade,
  alvo_tipo       text not null check (alvo_tipo in ('processo', 'contrato', 'cliente')),
  alvo_id         bigint not null,
  texto           text not null check (length(texto) <= 600),
  atualizada_em   timestamptz not null default now(),
  unique (usuaria_id, alvo_tipo, alvo_id)
);

create table alertas (
  id              bigint generated always as identity primary key,
  usuaria_id      uuid not null references usuarias(id) on delete cascade,
  tipo            text not null check (tipo in ('processo_parado', 'bloqueio_cliente', 'passivo_contrato')),
  processo_id     bigint references processos(id) on delete cascade,
  cliente_id      bigint references clientes(id) on delete cascade,
  contrato_id     bigint references contratos_gestao(id) on delete cascade,
  limite          numeric(14,2) not null,         -- dias (processo parado) ou reais
  ligado          boolean not null default true,
  disparou_em     timestamptz,
  criado_em       timestamptz not null default now()
);

create table notificacoes (
  id              bigint generated always as identity primary key,
  usuaria_id      uuid not null references usuarias(id) on delete cascade,
  tipo            text not null,                  -- movimentacao, bloqueio, reclamacao, alerta, resumo
  texto           text not null,
  alvo_tipo       text,                           -- para onde o toque leva
  alvo_id         bigint,
  lida            boolean not null default false,
  criada_em       timestamptz not null default now()
);
create index on notificacoes (usuaria_id, lida, criada_em desc);

create table relatorios_fixados (                 -- respostas da IA guardadas em Perfil
  id              bigint generated always as identity primary key,
  usuaria_id      uuid not null references usuarias(id) on delete cascade,
  pergunta        text not null,
  resposta        text not null,                  -- Markdown com os blocos de gráfico (consultas, não números)
  cliente_id      bigint references clientes(id),
  fixado_em       timestamptz not null default now()
);
-- As conversas com a IA NÃO são guardadas, só o que a sócia fixar.

-- --------------------------------------------------------------------
-- 4. CONTROLE E AUDITORIA
-- --------------------------------------------------------------------

create table sincronizacoes (                     -- cada importação: de onde, quem, quanto e se deu problema
  id              bigint generated always as identity primary key,
  fonte           text not null check (fonte in ('planilha_processos', 'planilha_bloqueios', 'datajud')),
  arquivo         text,                           -- nome do arquivo importado
  importado_por   uuid references usuarias(id),   -- quem subiu a planilha (vazio na rotina do DataJud)
  iniciada_em     timestamptz not null default now(),
  terminada_em    timestamptz,
  registros       integer,
  novos           integer,
  alterados       integer,
  problemas       jsonb not null default '[]',    -- [{linha, campo, mensagem}] para a equipe corrigir
  erro            text
);
-- O app mostra "dados de hoje, 9h12" a partir da última sincronização sem erro.

create table datajud_vistos (                     -- substitui o Redis: o que o DataJud já mostrou
  processo_id     bigint primary key references processos(id) on delete cascade,
  vistos          text[] not null default '{}',
  verificado_em   timestamptz not null default now()
);

create table auditoria (                          -- LGPD: quem exportou ou viu dados sensíveis
  id              bigint generated always as identity primary key,
  usuaria_id      uuid references usuarias(id),
  acao            text not null,                  -- entrou, exportou_pdf, abriu_processo, criou_alerta...
  alvo_tipo       text,
  alvo_id         bigint,
  quando          timestamptz not null default now()
);
create index on auditoria (usuaria_id, quando desc);

-- --------------------------------------------------------------------
-- 5. PROTEÇÃO: cada sócia só lê e altera o que é dela
-- --------------------------------------------------------------------
-- O servidor define `app.usuaria` a cada requisição, depois do login.
alter table anotacoes          enable row level security;
alter table alertas            enable row level security;
alter table notificacoes       enable row level security;
alter table relatorios_fixados enable row level security;
alter table seguidos           enable row level security;
alter table preferencias       enable row level security;

create policy so_a_dona on anotacoes          using (usuaria_id = current_setting('app.usuaria')::uuid);
create policy so_a_dona on alertas            using (usuaria_id = current_setting('app.usuaria')::uuid);
create policy so_a_dona on notificacoes       using (usuaria_id = current_setting('app.usuaria')::uuid);
create policy so_a_dona on relatorios_fixados using (usuaria_id = current_setting('app.usuaria')::uuid);
create policy so_a_dona on seguidos           using (usuaria_id = current_setting('app.usuaria')::uuid);
create policy so_a_dona on preferencias       using (usuaria_id = current_setting('app.usuaria')::uuid);
