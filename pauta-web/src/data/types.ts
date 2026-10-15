/* Tipos da base do escritório. Hoje vêm do gerador de exemplo; amanhã, da API. */

export type ClienteId = 'afne' | 'gnosis' | 'fas' | 'igedes';
export type Area = 'Trabalhista' | 'Cível' | 'Administrativo' | 'Constitucional';
export type Prognostico = 'Provável' | 'Possível' | 'Remoto';
export type Unidade = 'BRL' | 'quantidade';

export interface Movimento { date: string; text: string }

export interface Processo {
  id: string;
  numero: string;
  clienteId: ClienteId;
  cliente: string;
  area: Area;
  desc: string;
  contrato: string;
  status: string;
  diasParado: number;
  ultimaMov: Date;
  lastUpdate: string;
  movs: Movimento[];
  valorCausa: number;
  prognostico: Prognostico;
  entradaMes: number;
  prognosticoAntes?: { mes: number; era: Prognostico };
  valorAntes?: { mes: number; era: number };
}

export interface Bloqueio {
  id: string;
  processoId: string;
  clienteId: ClienteId;
  cliente: string;
  contrato: string;
  area: Area;
  /** Bloqueado hoje quando Ativo; valor original quando Levantado. */
  valorNum: number;
  valor: string;
  data: Date;
  mes: number;
  status: 'Ativo' | 'Levantado';
  sistema: string;
  historico: Movimento[];
  liberadoEm: Date | null;
  original: number;
  devolvido: number;
  perdido: number;
  devolvidoEm: Date | null;
  perdidoEm: Date | null;
}

export interface ContratoGestao { orgao: string; vigencia: string }

export interface Cliente {
  name: string;
  initials: string;
  processos: number;
  bloqueado: string;
  bloqueadoCurto: string;
  contratos: ContratoGestao[];
}

export interface Encerrado {
  id: string;
  clienteId: ClienteId;
  cliente: string;
  contrato: string;
  area: Area;
  valorCausa: number;
  prognostico: Prognostico;
  entradaMes: number;
  saiuMes: number;
  motivo: string;
  resultado: 'Favorável' | 'Desfavorável' | 'Acordo';
  valorRevertido: number;
}

export interface Reclamacao {
  id: string;
  clienteId: ClienteId;
  cliente: string;
  numero: string;
  status: 'Em andamento' | 'Julgada';
  liminar: 'Pendente' | 'Deferida';
  assunto: string;
  paradigma: string;
  ato: string;
  movs: [string, string][];
  processosOrigem: string[];
  valorDiscutido: number;
}

export interface Passivo { total: number; 'Provável': number; 'Possível': number; 'Remoto': number }
export interface MesPassivo extends Passivo { mes: string }

export interface VigenciaStatus { id: 'inativo' | 'atencao' | 'curso'; texto: string }

export interface ResumoBase {
  processos: Processo[];
  bloqueios: Bloqueio[];
  passivo: Passivo;
  bloqueadoAtivo: number;
  bloqueiosAtivos: number;
  levantado: number;
  perdido: number;
}
export interface ResumoContrato extends ResumoBase {
  orgId: ClienteId;
  orgao: string;
  vigencia: string;
  vigenciaStatus: VigenciaStatus;
}
export interface ResumoCliente extends ResumoBase { contratos: ResumoContrato[] }

export interface MesDesempenho {
  mes: string;
  rotulo: string;
  novos: number;
  encerrados: number;
  carteira: number;
  favoraveis: number;
  indiceAcumulado: number | null;
  levantadoValor: number;
  levantadoQtd: number;
  emDiscussao: number;
  revertido: number;
  mantido: number;
  revertidoAcumulado: number | null;
}
export interface SerieDesempenho {
  periodo: { de: string; ate: string };
  carteiraInicial: number;
  carteiraHoje: number;
  meses: MesDesempenho[];
}
export interface EncerradosPorGrupo { id: string; nome: string; novos: number; encerrados: number; emDiscussao: number; revertido: number }

export interface Conta { id: string; banco: string; cod: string; agencia: string; final: string; fim: string; bloqueios: Bloqueio[] }

export type EstadoBloqueio = 'novo' | 'ativo' | 'parado' | 'levantado' | 'perdido' | 'parcial';

/* Consultas usadas pelo assistente e pelos gráficos das respostas */
export interface Consulta {
  metrica: string;
  agrupar_por?: string;
  dividir_por?: string;
  cliente?: string;
  area?: string;
  contrato?: string;
  status_bloqueio?: string;
  prognostico?: string;
  dias_minimos_parado?: number;
  mes_inicio?: number;
  mes_fim?: number;
}
export interface ResultadoConsulta {
  metrica: string;
  unidade: Unidade;
  observacao?: string;
  total: number;
  grupos: { rotulo: string; valor: number }[];
}
export interface ResultadoCruzado {
  metrica: string;
  unidade: Unidade;
  partes: string[];
  grupos: { rotulo: string; total: number; valores: number[] }[];
}
export interface ConsultaProcessos { cliente?: string; area?: string; dias_minimos_parado?: number; apenas_com_bloqueio_ativo?: boolean; limite?: number }
export interface ProcessoListado {
  numero: string;
  cliente: string;
  contrato: string;
  area: string;
  descricao: string;
  status: string;
  dias_parado: number;
  valor_em_discussao: number;
  prognostico: Prognostico;
  valor_bloqueado_ativo: number;
}

export interface Ferramenta {
  name: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  execute: (input: Record<string, unknown>) => unknown;
}

export interface Base {
  Hn: Date;
  Se: Processo[];
  Tn: Bloqueio[];
  fe: Record<ClienteId, Cliente>;
  ti: ClienteId[];
  di: Record<ClienteId, string>;
  za: Reclamacao[];
  $o: Encerrado[];
  ir: { bloqueadoAtivo: number; processos: number; parados: number };
  nc: (l: Processo[]) => Processo[];
  bn: (v: number) => string;
  Xt: (v: number) => string;
  Lr: (a: Date, b: Date) => number;
  H1: (b: Bloqueio, p?: Processo) => EstadoBloqueio;
  Tk: (vigencia: string) => VigenciaStatus;
  Ws: (id: ClienteId, orgao: string) => ResumoContrato;
  aa: (id: ClienteId) => ResumoCliente;
  ac: (id: ClienteId, contrato?: string) => Encerrado[];
  Xf: (processos: Processo[], encerrados: Encerrado[]) => MesPassivo[];
  ra: (q: Consulta) => ResultadoConsulta;
  o2: (q: Consulta) => ResultadoCruzado;
  i2: (q: ConsultaProcessos) => ProcessoListado[];
  Fk: (progress: (s: string) => void) => Ferramenta[];
  Mk: (cliente: ClienteId | null) => string;
  l2: (erro: unknown) => string;
  qw: (periodo: '2026') => SerieDesempenho;
  jw: () => { qtd: number; valor: number; diasMedio: number };
  Pw: (por: 'area' | 'cliente', nomes: Record<string, string>) => EncerradosPorGrupo[];
  V10contas: (id: ClienteId, orgao: string, bloqueios: Bloqueio[]) => Conta[];
  V12data: (s: string) => Date;
  V12mesLongo: (rotulo: string, comAno?: boolean) => string;
}
