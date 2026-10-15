import { useState } from 'react';
import {
  ArrowUpRight, Bell, Bookmark, Building2, Calendar, Check, ChevronRight, Clock, Copy, Database, FileText,
  Flag, Gavel, Grid2x2, History, Home, Landmark, Layers, Lock, Mail, MessageSquare, Mic, Moon, PanelRight,
  Phone, RefreshCw, Scale, Search, SlidersHorizontal, Sparkles, Sun, Trash2, TrendingUp, Users, Wallet, X,
} from 'lucide-react';

import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
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
      <p className="foot">components.json, src/lib/utils.ts e src/components/ui/* — tudo gerado à mão porque a CLI do shadcn não alcança ui.shadcn.com nesta sessão. Peça mais componentes (Dialog, Select, DropdownMenu…) quando precisar.</p>
    </div>
  );
}
