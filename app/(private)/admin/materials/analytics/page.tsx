"use client"

import { 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight,
  Wallet,
  Activity,
  History,
  Target,
  Zap,
  ShieldAlert
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { mockMaterials } from "@/lib/mock-materials"

export default function AnalyticsPage() {
  const totalValue = mockMaterials.reduce((acc, m) => acc + (m.stock * m.cost), 0)
  const monthlyProjection = mockMaterials.reduce((acc, m) => acc + ((m.monthlyUsage || 0) * m.cost), 0)
  
  // Group by category for "Spending by Department"
  const categoryData = mockMaterials.reduce((acc, m) => {
    const value = (m.monthlyUsage || 0) * m.cost
    acc[m.category] = (acc[m.category] || 0) + value
    return acc
  }, {} as Record<string, number>)

  const sortedCategories = Object.entries(categoryData)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  const maxCategoryValue = Math.max(...Object.values(categoryData))

  // "Surprise" Logic: Capital at Risk (Waste Prediction)
  const capitalAtRisk = mockMaterials.reduce((acc, m) => {
    const riskFactor = (m.wasteRisk || 0) / 100
    return acc + (m.stock * m.cost * riskFactor)
  }, 0)

  return (
    <div className="flex flex-1 flex-col gap-8 p-8 pt-6 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/80 to-foreground/50">
            Inteligência Financeira
          </h2>
          <p className="text-muted-foreground text-lg">
            Visão estratégica de capital, riscos e otimização de custos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-primary/20 bg-background/5 hover:bg-primary/10 transition-all">
            <History className="mr-2 h-4 w-4" /> Histórico
          </Button>
          <Button className="bg-primary shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95">
            <Target className="mr-2 h-4 w-4" /> Definir Metas
          </Button>
        </div>
      </div>

      {/* Strategic Insights Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-md group">
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Wallet className="h-24 w-24 rotate-12" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest opacity-60">Capital Imobilizado</CardTitle>
            <div className="p-1.5 bg-primary/20 rounded-lg"><DollarSign className="h-4 w-4 text-primary" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tighter">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
            </div>
            <p className="text-xs text-muted-foreground pt-2 flex items-center gap-1">
              <span className="text-emerald-500 font-bold flex items-center">
                <ArrowDownRight className="h-3 w-3" /> 2.4%
              </span> 
              otimização este mês
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-orange-500/20 to-orange-500/5 backdrop-blur-md group">
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <ShieldAlert className="h-24 w-24 rotate-12 text-orange-500" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest opacity-60">Capital em Risco</CardTitle>
            <div className="p-1.5 bg-orange-500/20 rounded-lg"><Zap className="h-4 w-4 text-orange-500" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tighter text-orange-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(capitalAtRisk)}
            </div>
            <p className="text-xs text-muted-foreground pt-2 flex items-center gap-1">
              Produtos próximos ao vencimento
            </p>
          </CardContent>
        </Card>

        <Card className="border-muted-foreground/10 bg-card/40 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest opacity-60">Custo de Reposição</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black tracking-tighter">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthlyProjection)}
            </div>
            <p className="text-xs text-muted-foreground pt-1">Projeção para os próximos 30 dias</p>
          </CardContent>
        </Card>

        <Card className="border-muted-foreground/10 bg-card/40 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest opacity-60">Score de Eficiência</CardTitle>
            <BarChart3 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tighter text-emerald-500">8.4</div>
            <div className="h-1.5 w-full bg-muted mt-2 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[84%] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-12">
        {/* Surprise: Smart Recommendations */}
        <Card className="lg:col-span-5 border-none bg-primary/5 hover:bg-primary/10 transition-colors">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              Recomendações Estratégicas
            </CardTitle>
            <CardDescription>Ações sugeridas para otimizar seu fluxo financeiro.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl border border-orange-500/20 bg-orange-500/5 flex gap-4">
              <div className="p-2 h-fit bg-orange-500/20 rounded-lg"><ShieldAlert className="h-5 w-5 text-orange-500" /></div>
              <div>
                <h4 className="font-bold text-sm text-orange-700">Risco de Perda Detectado</h4>
                <p className="text-xs text-orange-600/80 leading-relaxed mt-1">
                  <b>Creme de leite Nestlé</b> vence em 24 dias. Consumo atual não esgotará o estoque a tempo. Considere usar em produções promocionais.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex gap-4">
              <div className="p-2 h-fit bg-emerald-500/20 rounded-lg"><TrendingDown className="h-5 w-5 text-emerald-500" /></div>
              <div>
                <h4 className="font-bold text-sm text-emerald-700">Oportunidade de Compra</h4>
                <p className="text-xs text-emerald-600/80 leading-relaxed mt-1">
                  <b>Pote 250ml</b> está com tendência de queda no preço (-4%). Aguarde 1 semana para realizar a reposição mensal.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 flex gap-4">
              <div className="p-2 h-fit bg-blue-500/20 rounded-lg"><TrendingUp className="h-5 w-5 text-blue-500" /></div>
              <div>
                <h4 className="font-bold text-sm text-blue-700">Alerta de Inflação</h4>
                <p className="text-xs text-blue-600/80 leading-relaxed mt-1">
                  <b>Leite condensado Moça</b> subiu 8% no último mês. Considere buscar marcas alternativas como <i>Itambé</i> para manter a margem.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Investment Distribution */}
        <Card className="lg:col-span-7 border-muted-foreground/10 bg-card/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl">Distribuição de Investimento por Depto.</CardTitle>
            <CardDescription>Onde seu dinheiro está concentrado hoje.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 pt-4">
              {sortedCategories.map(([category, value]) => (
                <div key={category} className="group">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-bold text-foreground/70 group-hover:text-primary transition-colors">{category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        {Math.round((value / monthlyProjection) * 100)}% do total
                      </span>
                      <span className="font-mono font-black text-foreground/90">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                      </span>
                    </div>
                  </div>
                  <div className="h-3 w-full bg-muted rounded-full overflow-hidden p-0.5 border border-muted-foreground/5">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(var(--primary),0.3)] ${
                        (value / maxCategoryValue) > 0.7 ? "bg-gradient-to-r from-primary/60 to-primary" : "bg-gradient-to-r from-primary/30 to-primary/60"
                      }`}
                      style={{ width: `${(value / maxCategoryValue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Button({ className, variant, ...props }: any) {
  const variants: any = {
    outline: "border border-input bg-background/50 hover:bg-accent hover:text-accent-foreground",
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
  }
  return (
    <button 
      className={`inline-flex items-center justify-center rounded-lg text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-5 py-2 ${variants[variant || 'default']} ${className}`}
      {...props}
    />
  )
}

function TrendingDown({ className, ...props }: any) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className} 
      {...props}
    >
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
      <polyline points="16 17 22 17 22 11" />
    </svg>
  )
}
