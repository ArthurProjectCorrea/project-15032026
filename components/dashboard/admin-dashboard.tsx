'use client';

import * as React from 'react';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  Box,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Cell,
  Pie,
  PieChart,
  LabelList,
} from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export function AdminDashboard() {
  const [stats, setStats] = React.useState<{
    totalProducts: number;
    totalStock: number;
    expiringSoon: number;
  } | null>(null);
  const [chartData, setChartData] = React.useState<{
    stockByBrand: { brand: string; quantity: number }[];
    stockByExpiry: { status: string; quantity: number; fill: string }[];
  } | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function init() {
      try {
        const [statsRes, chartsRes] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/dashboard/charts'),
        ]);

        if (!statsRes.ok || !chartsRes.ok)
          throw new Error('Erro ao carregar dados');

        setStats(await statsRes.json());
        setChartData(await chartsRes.json());
      } catch {
        toast.error('Ocorreu um erro ao carregar o dashboard');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const brandChartConfig = {
    quantity: {
      label: 'Quantidade',
      color: '#f43f5e', // rose-500
    },
  } satisfies ChartConfig;

  const expiryChartConfig = {
    quantity: {
      label: 'Quantidade',
    },
    Vencido: {
      label: 'Vencido',
      color: '#e11d48', // rose-600
    },
    'Próximo (30d)': {
      label: 'Próximo (30d)',
      color: '#fb7185', // rose-400
    },
    'No Prazo': {
      label: 'No Prazo',
      color: '#fda4af', // rose-300
    },
    'Sem Data': {
      label: 'Sem Data',
      color: '#fecdd3', // rose-200
    },
  } satisfies ChartConfig;

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-[350px] w-full md:col-span-2" />
        <Skeleton className="h-[350px] w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo ao seu painel de controle de estoque.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Produtos
            </CardTitle>
            <Package className="size-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts}</div>
            <p className="text-muted-foreground text-xs">
              Produtos cadastrados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Quantidade em Estoque
            </CardTitle>
            <Box className="size-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalStock?.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">Unidades totais</p>
          </CardContent>
        </Card>
        <Card
          className={
            stats?.expiringSoon && stats.expiringSoon > 0
              ? 'border-rose-200 bg-rose-50/20'
              : ''
          }
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Próximos ao Vencimento
            </CardTitle>
            <AlertTriangle
              className={`size-4 ${stats?.expiringSoon && stats.expiringSoon > 0 ? 'text-rose-500' : 'text-muted-foreground'}`}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.expiringSoon || 0}</div>
            <p className="text-muted-foreground text-xs">
              Vencendo nos próximos 30 dias
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Estoque por Marca</CardTitle>
            <CardDescription>
              Top 5 marcas com maior volume em estoque.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={brandChartConfig}
              className="min-h-[300px] w-full"
            >
              <BarChart
                accessibilityLayer
                data={chartData?.stockByBrand}
                layout="vertical"
                margin={{ left: -20 }}
              >
                <CartesianGrid horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="brand"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  width={100}
                />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Bar
                  dataKey="quantity"
                  fill="var(--color-quantity)"
                  radius={4}
                  barSize={32}
                >
                  <LabelList
                    dataKey="quantity"
                    position="right"
                    offset={8}
                    className="fill-foreground font-medium"
                    fontSize={12}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 leading-none font-medium">
              Volume de estoque concentrado <ArrowUpRight className="h-4 w-4" />
            </div>
          </CardFooter>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Distribuição por Validade</CardTitle>
            <CardDescription>
              Status atual dos lotes em estoque.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={expiryChartConfig}
              className="mx-auto aspect-square max-h-[300px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={chartData?.stockByExpiry}
                  dataKey="quantity"
                  nameKey="status"
                  innerRadius={60}
                  strokeWidth={5}
                >
                  {chartData?.stockByExpiry.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        (
                          expiryChartConfig as Record<
                            string,
                            { color?: string }
                          >
                        )[entry.status]?.color || '#ccc'
                      }
                    />
                  ))}
                </Pie>
                <ChartLegend
                  content={<ChartLegendContent nameKey="status" />}
                  className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 leading-none font-medium">
              Resumo de integridade do estoque{' '}
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground leading-none">
              Baseado nos lotes com data de validade informada.
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
