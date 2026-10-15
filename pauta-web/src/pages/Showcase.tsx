import { useState } from 'react';
import {
  AlertTriangle, ArrowUpRight, Bell, Bookmark, Building2, Calendar, Check, ChevronRight, Clock, Copy, Database,
  FileText, Flag, Gavel, Grid2x2, History, Home, Landmark, Layers, Lock, Mail, MessageSquare, Mic, Moon,
  MoreHorizontal, PanelRight, Phone, RefreshCw, Scale, Search, SlidersHorizontal, Sparkles, Sun, Trash2,
  TrendingUp, Users, Wallet, X,
} from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Skeleton } from '../components/ui/skeleton';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '../components/ui/tooltip';

const ICONS: [string, React.ComponentType<{ className?: string }>][] = [
  ['Scale', Scale], ['Gavel', Gavel], ['Lock', Lock], ['Landmark', Landmark], ['Building2', Building2],
  ['TrendingUp', TrendingUp], ['Sparkles', Sparkles], ['FileText', FileText], ['Clock', Clock], ['Search', Search],
  ['Bell', Bell], ['Check', Check], ['X', X], ['ArrowUpRight', ArrowUpRight], ['ChevronRight', ChevronRight],
  ['Bookmark', Bookmark], ['Trash2', Trash2], ['Copy', Copy], ['RefreshCw', RefreshCw], ['Database', Database],
  ['Layers', Layers], ['MessageSquare', MessageSquare], ['Users', Users], ['Wallet', Wallet], ['Calendar', Calendar],
  ['Flag', Flag], ['Mic', Mic], ['Phone', Phone], ['Mail', Mail], ['PanelRight', PanelRight],
  ['History', History], ['Grid2x2', Grid2x2], ['Home', Home], ['Sun', Sun], ['Moon', Moon],
  ['SlidersHorizontal', SlidersHorizontal],
];

function Secao({ titulo, desc, children }: { titulo: string; desc: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <div><h2 className="font-serif text-[22px] leading-tight -tracking-[0.01em]">{titulo}</h2><p className="text-muted-foreground text-[13.5px] mt-1">{desc}</p></div>
      <div className="surface" style={{ padding: 24 }}>{children}</div>
    </section>
  );
}

export function Showcase() {
  const [switched, setSwitched] = useState(true);
  const [marc, setMarc] = useState(true);
  return (
    <div className="page v-in">
      <header className="ph fill-in">
        <div>
          <h1>Componentes</h1>
          <p>Catálogo do que já está instalado — shadcn/ui (Tailwind + Radix) e os ícones Lucide. Use como referência antes de desenhar uma tela nova.</p>
        </div>
      </header>

      <Secao titulo="Botões" desc="components/ui/button.tsx — variantes default, secondary, outline, ghost, link, destructive e ai (acento da IA).">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="ai"><Sparkles className="size-4" />AI</Button>
          <Button size="icon" variant="outline"><Search className="size-4" /></Button>
          <Button size="sm" variant="secondary">Small</Button>
        </div>
      </Secao>

      <Secao titulo="Badges" desc="components/ui/badge.tsx — além das variantes padrão, good/warn/bad reaproveitam os tokens de estado já usados no resto do app.">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="ai"><Sparkles className="size-3" />IA</Badge>
          <Badge variant="good"><Check className="size-3" />Devolvido</Badge>
          <Badge variant="warn">Atenção</Badge>
          <Badge variant="bad">Perdido</Badge>
        </div>
      </Secao>

      <div className="row r21">
        <Secao titulo="Card" desc="components/ui/card.tsx — cabeçalho com título em serifa, descrição, conteúdo e rodapé.">
          <Card>
            <CardHeader>
              <CardTitle>Instituto Gnosis</CardTitle>
              <CardDescription>Raio-x do cliente · 20 processos, 4 parados</CardDescription>
            </CardHeader>
            <CardContent className="text-[13.5px] text-muted-foreground">
              Passivo estimado de R$ 2,89 mi, R$ 943 mil bloqueados hoje e R$ 162 mil devolvidos em 2026.
            </CardContent>
            <CardFooter className="gap-2">
              <Button size="sm" variant="ai"><Sparkles className="size-3.5" />Perguntar ao assistente</Button>
              <Button size="sm" variant="ghost">Abrir cliente</Button>
            </CardFooter>
          </Card>
        </Secao>

        <Secao titulo="Avatar, Tooltip e Switch" desc="components/ui/avatar.tsx, tooltip.tsx e switch.tsx.">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <Avatar><AvatarFallback>OM</AvatarFallback></Avatar>
              <Avatar><AvatarFallback className="bg-accent text-accent-foreground">IA</AvatarFallback></Avatar>
              <Tooltip>
                <TooltipTrigger asChild><Button size="icon" variant="outline"><RefreshCw className="size-4" /></Button></TooltipTrigger>
                <TooltipContent>Perguntar de novo</TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="sw1" checked={switched} onCheckedChange={setSwitched} />
              <Label htmlFor="sw1">{switched ? 'Usar contexto da tela' : 'Sem contexto da tela'}</Label>
            </div>
          </div>
        </Secao>
      </div>

      <Secao titulo="Input e Label" desc="components/ui/input.tsx e label.tsx.">
        <div className="flex flex-col gap-2" style={{ maxWidth: 360 }}>
          <Label htmlFor="ex-input">Buscar processo</Label>
          <Input id="ex-input" placeholder="Número, cliente ou assunto" />
        </div>
      </Secao>

      <Secao titulo="Tabs" desc="components/ui/tabs.tsx — mesmo padrão usado hoje nas abas do Canvas e do detalhe de processo, versão Radix.">
        <Tabs defaultValue="resumo">
          <TabsList>
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="movs">Linha do tempo</TabsTrigger>
            <TabsTrigger value="rascunho">Rascunho</TabsTrigger>
          </TabsList>
          <TabsContent value="resumo" className="text-[13.5px] text-muted-foreground pt-3">Situação, valores e prognóstico do processo.</TabsContent>
          <TabsContent value="movs" className="text-[13.5px] text-muted-foreground pt-3">Movimentações em ordem cronológica.</TabsContent>
          <TabsContent value="rascunho" className="text-[13.5px] text-muted-foreground pt-3">Minuta gerada pelo assistente a partir dos dados do processo.</TabsContent>
        </Tabs>
      </Secao>

      <div className="row r21">
        <Secao titulo="Select e Checkbox" desc="components/ui/select.tsx e checkbox.tsx — Radix por baixo, mesmo visual dos outros campos.">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2" style={{ maxWidth: 280 }}>
              <Label>Cliente</Label>
              <Select defaultValue="gnosis">
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os clientes</SelectItem>
                  <SelectItem value="afne">AFNE</SelectItem>
                  <SelectItem value="gnosis">Instituto Gnosis</SelectItem>
                  <SelectItem value="fas">FAS</SelectItem>
                  <SelectItem value="igedes">IGEDES</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="ck1" checked={marc} onCheckedChange={v => setMarc(!!v)} />
              <Label htmlFor="ck1">Selecionar processo para o assistente analisar</Label>
            </div>
          </div>
        </Secao>

        <Secao titulo="Dropdown e Popover" desc="components/ui/dropdown-menu.tsx e popover.tsx.">
          <div className="flex flex-wrap items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="outline" size="icon"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Processo 0260884-61</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem><Bookmark className="size-4" />Seguir</DropdownMenuItem>
                <DropdownMenuItem><Copy className="size-4" />Copiar número</DropdownMenuItem>
                <DropdownMenuItem variant="destructive"><Trash2 className="size-4" />Remover dos fixados</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Popover>
              <PopoverTrigger asChild><Button variant="outline">Filtros <ChevronRight className="size-3.5 rotate-90" /></Button></PopoverTrigger>
              <PopoverContent className="flex flex-col gap-3">
                <div className="flex items-center gap-2"><Checkbox id="f1" defaultChecked /><Label htmlFor="f1">Parados 90+</Label></div>
                <div className="flex items-center gap-2"><Checkbox id="f2" /><Label htmlFor="f2">Com bloqueio ativo</Label></div>
              </PopoverContent>
            </Popover>
          </div>
        </Secao>
      </div>

      <Secao titulo="Dialog" desc="components/ui/dialog.tsx — para confirmações, como trocar um .confirm() nativo.">
        <Dialog>
          <DialogTrigger asChild><Button variant="destructive">Apagar conversa</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Apagar esta conversa?</DialogTitle>
              <DialogDescription>As mensagens somem do histórico deste navegador. Não dá para desfazer.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost">Cancelar</Button>
              <Button variant="destructive">Apagar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Secao>

      <Secao titulo="Alert e Skeleton" desc="components/ui/alert.tsx e skeleton.tsx — avisos inline e estado de carregamento.">
        <div className="flex flex-col gap-4">
          <Alert variant="warn">
            <AlertTriangle className="size-4" />
            <AlertTitle>18 bloqueios sem pedido de desbloqueio</AlertTitle>
            <AlertDescription>Há mais de 15 dias sem manifestação protocolada.</AlertDescription>
          </Alert>
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex flex-col gap-2"><Skeleton className="h-3.5 w-40" /><Skeleton className="h-3 w-28" /></div>
          </div>
        </div>
      </Secao>

      <Secao titulo="Textarea" desc="components/ui/textarea.tsx.">
        <Textarea placeholder="Pergunte como falaria com um colega" style={{ maxWidth: 480 }} />
      </Secao>

      <Secao titulo="Ícones Lucide" desc="lucide-react — mesmo pacote de ícones que o shadcn usa por padrão. O app ainda desenha os próprios ícones (components/Icon.tsx); use estes para componentes novos ou troque aos poucos.">
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))', gap: 4 }}>
          {ICONS.map(([name, IconC]) => (
            <div key={name} className="flex flex-col items-center gap-1.5 rounded-md p-3 text-center hover:bg-muted" style={{ transition: 'background .15s' }}>
              <IconC className="size-[18px] text-foreground" />
              <span className="text-[10.5px] text-muted-foreground leading-tight break-all">{name}</span>
            </div>
          ))}
        </div>
      </Secao>

      <Separator />
      <p className="foot">components.json, src/lib/utils.ts e src/components/ui/* — tudo gerado à mão porque a CLI do shadcn não alcança ui.shadcn.com nesta sessão. Peça mais componentes quando precisar.</p>
    </div>
  );
}
