import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { DateRange as PickerDateRange } from 'react-day-picker';
import {
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  X,
  AlertTriangle,
  Info,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Header } from '../../components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  analyticsService,
  type AnalyticsPeriod,
  type CategoryStats,
  type AggregatedPeriod,
  type Insight,
} from '../../services/analytics.service';
import {
  AnalyticsWrapper,
  AnalyticsMain,
  AnalyticsContent,
  PageTitle,
  FilterSection,
  PeriodSelector,
  PeriodButton,
  PeriodSelectWrapper,
  DatePickerTriggerButton,
  ClearDateRangeButton,
  StatsGrid,
  ChartSection,
  SectionTitle,
  ChartsGrid,
  ChartCard,
  ChartCardFull,
  ChartContainer,
  InsightsSection,
  InsightsList,
  InsightCard,
  CustomTooltipContainer,
  TooltipLabel,
  TooltipValue,
} from './styles';

function CustomPieTooltip({ active, payload, theme }: { active?: boolean; payload?: any[]; theme: 'light' | 'dark' }) {
  if (active && payload && payload.length) {
    const data = payload[0];
    const name = data.name;
    const value = data.value;
    const percent = ((data.payload.percent ?? 0) * 100).toFixed(0);

    return (
      <CustomTooltipContainer $isDark={theme === 'dark'}>
        <TooltipLabel>{name}</TooltipLabel>
        <TooltipValue>
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(value)} ({percent}%)
        </TooltipValue>
      </CustomTooltipContainer>
    );
  }
  return null;
}

const PeriodSelectButton = PeriodButton;

export function Analytics() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { theme } = useTheme();

  const [selectedPeriod, setSelectedPeriod] = useState<AnalyticsPeriod>('month');
  const [dateRange, setDateRange] = useState<PickerDateRange | undefined>(
    undefined
  );

  const rangeForApi =
    dateRange?.from && dateRange?.to
      ? { from: dateRange.from, to: dateRange.to }
      : undefined;

  const [stats, setStats] = useState<{
    income: number;
    expense: number;
    balance: number;
    incomeChange: number;
    expenseChange: number;
    balanceChange: number;
  }>({
    income: 0,
    expense: 0,
    balance: 0,
    incomeChange: 0,
    expenseChange: 0,
    balanceChange: 0,
  });
  const [categories, setCategories] = useState<CategoryStats[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<AggregatedPeriod[]>([]);
  const [monthlyComparison, setMonthlyComparison] = useState<AggregatedPeriod[]>([]);
  const [investmentData, setInvestmentData] = useState<{
    totalInvested: number;
    totalValue: number;
    totalProfit: number;
    profitPercentage: number;
    evolution: Array<{ month: string; portfolioValue: number }>;
    byAssetClass: Array<{ name: string; value: number }>;
  } | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);

  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingTimeSeries, setIsLoadingTimeSeries] = useState(false);
  const [isLoadingMonthly, setIsLoadingMonthly] = useState(false);
  const [isLoadingInvestments, setIsLoadingInvestments] = useState(false);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const loadStats = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingStats(true);
    try {
      const data = await analyticsService.fetchStats(selectedPeriod, rangeForApi);
      setStats(data);
    } catch (e) {
      console.error('Erro ao carregar estatísticas:', e);
    } finally {
      setIsLoadingStats(false);
    }
  }, [isAuthenticated, selectedPeriod, rangeForApi]);

  const loadCategories = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingCategories(true);
    try {
      const data = await analyticsService.fetchExpensesByCategory(
        selectedPeriod,
        rangeForApi
      );
      setCategories(data);
    } catch (e) {
      console.error('Erro ao carregar categorias:', e);
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  }, [isAuthenticated, selectedPeriod, rangeForApi]);

  const loadTimeSeries = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingTimeSeries(true);
    try {
      const granularity = selectedPeriod === 'week' ? 'week' : 'month';
      const data = await analyticsService.fetchTimeSeriesData(
        selectedPeriod,
        rangeForApi,
        granularity
      );
      setTimeSeriesData(data);
    } catch (e) {
      console.error('Erro ao carregar série temporal:', e);
      setTimeSeriesData([]);
    } finally {
      setIsLoadingTimeSeries(false);
    }
  }, [isAuthenticated, selectedPeriod, rangeForApi]);

  const loadMonthlyComparison = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingMonthly(true);
    try {
      const data = await analyticsService.fetchMonthlyComparison(6);
      setMonthlyComparison(data);
    } catch (e) {
      console.error('Erro ao carregar comparação mensal:', e);
      setMonthlyComparison([]);
    } finally {
      setIsLoadingMonthly(false);
    }
  }, [isAuthenticated]);

  const loadInvestments = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingInvestments(true);
    try {
      const data = await analyticsService.fetchInvestmentData();
      setInvestmentData({
        totalInvested: data.totalInvested,
        totalValue: data.totalValue,
        totalProfit: data.totalProfit,
        profitPercentage: data.profitPercentage,
        evolution: data.evolution,
        byAssetClass: data.byAssetClass,
      });
    } catch (e) {
      console.error('Erro ao carregar investimentos:', e);
      setInvestmentData(null);
    } finally {
      setIsLoadingInvestments(false);
    }
  }, [isAuthenticated, selectedPeriod, rangeForApi]);

  const loadInsights = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingInsights(true);
    try {
      const data = await analyticsService.generateInsights(
        selectedPeriod,
        rangeForApi
      );
      setInsights(data);
    } catch (e) {
      console.error('Erro ao gerar insights:', e);
      setInsights([]);
    } finally {
      setIsLoadingInsights(false);
    }
  }, [isAuthenticated, selectedPeriod, rangeForApi]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void loadStats();
    void loadCategories();
    void loadTimeSeries();
    void loadInsights();
  }, [
    isAuthenticated,
    loadStats,
    loadCategories,
    loadTimeSeries,
    loadInsights,
  ]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void loadMonthlyComparison();
  }, [isAuthenticated, loadMonthlyComparison]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void loadInvestments();
  }, [isAuthenticated, loadInvestments]);

  const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  // Filtrar investimentos dos gráficos de gastos (mostrar separadamente)
  const expensesCategories = categories.filter((c) => c.name !== 'Investimentos');
  
  const pieData = expensesCategories.map((c) => ({ name: c.name, value: c.value }));

  if (authLoading) {
    return null;
  }

  return (
    <AnalyticsWrapper $theme={theme}>
      <Header />
      <AnalyticsMain>
        <AnalyticsContent>
          <PageTitle id="analytics-title">Análises</PageTitle>

          <FilterSection aria-label="Filtro de período">
            <PeriodSelector role="group" aria-label="Período">
              <PeriodButton
                type="button"
                $active={selectedPeriod === 'month'}
                onClick={() => {
                  setSelectedPeriod('month');
                  setDateRange(undefined);
                }}
              >
                Este mês
              </PeriodButton>
              <PeriodButton
                type="button"
                $active={selectedPeriod === 'year'}
                onClick={() => {
                  setSelectedPeriod('year');
                  setDateRange(undefined);
                }}
              >
                Este ano
              </PeriodButton>
              <PeriodSelectWrapper>
                <Popover>
                  <PopoverTrigger asChild>
                    <DatePickerTriggerButton type="button">
                      <PeriodSelectButton
                        type="button"
                        $active={
                          selectedPeriod === 'custom' &&
                          !!dateRange?.from &&
                          !!dateRange?.to
                        }
                      >
                        <CalendarIcon size={16} aria-hidden />
                        {dateRange?.from && dateRange?.to
                          ? `${format(dateRange.from, 'dd/MM/yyyy', {
                              locale: ptBR,
                            })} - ${format(dateRange.to, 'dd/MM/yyyy', {
                              locale: ptBR,
                            })}`
                          : 'Selecionar período'}
                      </PeriodSelectButton>
                    </DatePickerTriggerButton>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={(range) => {
                        setDateRange(range);
                        if (range?.from && range?.to) {
                          setSelectedPeriod('custom');
                        }
                      }}
                      locale={ptBR}
                      numberOfMonths={2}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {dateRange?.from && dateRange?.to && (
                  <ClearDateRangeButton
                    type="button"
                    onClick={() => setDateRange(undefined)}
                    aria-label="Limpar filtro de datas"
                  >
                    <X size={16} aria-hidden />
                  </ClearDateRangeButton>
                )}
              </PeriodSelectWrapper>
            </PeriodSelector>
          </FilterSection>

          <StatsGrid role="list">
            <Card role="listitem">
              <CardHeader className="pb-1 flex flex-row items-center justify-between">
                <CardTitle className="text-base">Receitas</CardTitle>
                {isLoadingStats ? (
                  <Skeleton className="h-4 w-16" />
                ) : (
                  <span
                    className={`text-xs flex items-center gap-0.5 ${
                      stats.incomeChange >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stats.incomeChange >= 0 ? (
                      <TrendingUp size={14} aria-hidden />
                    ) : (
                      <TrendingDown size={14} aria-hidden />
                    )}
                    {stats.incomeChange >= 0 ? '+' : ''}
                    {stats.incomeChange.toFixed(1)}%
                  </span>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                {isLoadingStats ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <span className="text-xl font-semibold text-green-600">
                    {currencyFormatter.format(stats.income)}
                  </span>
                )}
              </CardContent>
            </Card>
            <Card role="listitem">
              <CardHeader className="pb-1 flex flex-row items-center justify-between">
                <CardTitle className="text-base">Gastos</CardTitle>
                {isLoadingStats ? (
                  <Skeleton className="h-4 w-16" />
                ) : (
                  <span
                    className={`text-xs flex items-center gap-0.5 ${
                      stats.expenseChange <= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stats.expenseChange <= 0 ? (
                      <TrendingUp size={14} aria-hidden />
                    ) : (
                      <TrendingDown size={14} aria-hidden />
                    )}
                    {stats.expenseChange >= 0 ? '+' : ''}
                    {stats.expenseChange.toFixed(1)}%
                  </span>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                {isLoadingStats ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <span className="text-xl font-semibold text-red-600">
                    {currencyFormatter.format(stats.expense)}
                  </span>
                )}
              </CardContent>
            </Card>
            <Card role="listitem">
              <CardHeader className="pb-1 flex flex-row items-center justify-between">
                <CardTitle className="text-base">Saldo</CardTitle>
                {isLoadingStats ? (
                  <Skeleton className="h-4 w-16" />
                ) : (
                  <span
                    className={`text-xs flex items-center gap-0.5 ${
                      stats.balanceChange >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stats.balanceChange >= 0 ? (
                      <TrendingUp size={14} aria-hidden />
                    ) : (
                      <TrendingDown size={14} aria-hidden />
                    )}
                    {stats.balanceChange >= 0 ? '+' : ''}
                    {stats.balanceChange.toFixed(1)}%
                  </span>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                {isLoadingStats ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <span
                    className={`text-xl font-semibold ${
                      stats.balance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {currencyFormatter.format(stats.balance)}
                  </span>
                )}
              </CardContent>
            </Card>
            <Card role="listitem">
              <CardHeader className="pb-1 flex flex-row items-center justify-between">
                <CardTitle className="text-base">Investimentos</CardTitle>
                {isLoadingInvestments ? (
                  <Skeleton className="h-4 w-16" />
                ) : (
                  <span></span>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                {isLoadingInvestments ? (
                  <Skeleton className="h-8 w-24" />
                ) : investmentData ? (
                  <span className="text-xl font-semibold">
                    {currencyFormatter.format(investmentData.totalValue)}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Sem dados
                  </span>
                )}
              </CardContent>
            </Card>
          </StatsGrid>

          <ChartSection aria-labelledby="chart-expenses-title">
            <SectionTitle id="chart-expenses-title">
              Gastos por categoria
            </SectionTitle>
            <ChartsGrid>
              <ChartCard>
                {isLoadingCategories ? (
                  <Skeleton className="h-72 w-full" />
                ) : pieData.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum dado no período.
                  </p>
                ) : (
                  <ChartContainer>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius="80%"
                          label={({ name, percent }) =>
                            `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                          }
                        >
                          {categories.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip theme={theme} />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </ChartCard>
              <ChartCard>
                {isLoadingCategories ? (
                  <Skeleton className="h-72 w-full" />
                ) : expensesCategories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum dado no período.
                  </p>
                ) : (
                  <ChartContainer>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={expensesCategories.slice(0, 8)}
                        layout="vertical"
                        margin={{ left: 80 }}
                      >
                        <XAxis
                          type="number"
                          tickFormatter={(v) =>
                            v >= 1000 ? `R$ ${v / 1000}k` : `R$ ${v}`
                          }
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={75}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                          cursor={false}
                          contentStyle={{
                            backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
                            border: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e5e5e5'}`,
                            borderRadius: '0.5rem',
                            color: theme === 'dark' ? '#ffffff' : '#111827',
                            padding: '0.75rem',
                          }}
                          formatter={(value: number | undefined) =>
                            value != null
                              ? currencyFormatter.format(value)
                              : ''
                          }
                        />
                        <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </ChartCard>
            </ChartsGrid>
          </ChartSection>

          <ChartSection aria-labelledby="chart-evolution-title">
            <SectionTitle id="chart-evolution-title">
              Evolução no período
            </SectionTitle>
            <ChartCardFull>
              {isLoadingTimeSeries ? (
                <Skeleton className="h-72 w-full" />
              ) : timeSeriesData.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum dado no período.
                </p>
              ) : (
                <ChartContainer>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={timeSeriesData}
                      margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
                    >
                      <XAxis dataKey="label" />
                      <YAxis
                        tickFormatter={(v) =>
                          v >= 1000 ? `R$ ${v / 1000}k` : `R$ ${v}`
                        }
                      />
                      <Tooltip
                        cursor={false}
                        contentStyle={{
                          backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
                          border: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e5e5e5'}`,
                          borderRadius: '0.5rem',
                          color: theme === 'dark' ? '#ffffff' : '#111827',
                          padding: '0.75rem',
                        }}
                        formatter={(value: number | undefined) =>
                          value != null
                            ? currencyFormatter.format(value)
                            : ''
                        }
                        labelFormatter={(label) => label}
                      />
                      <Legend />
                      <Bar dataKey="incomes" name="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenses" name="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </ChartCardFull>
          </ChartSection>

          <ChartSection aria-labelledby="chart-monthly-title">
            <SectionTitle id="chart-monthly-title">
              Comparação mês a mês (últimos 6 meses)
            </SectionTitle>
            <ChartCardFull>
              {isLoadingMonthly ? (
                <Skeleton className="h-72 w-full" />
              ) : monthlyComparison.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum dado disponível.
                </p>
              ) : (
                <ChartContainer>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyComparison}
                      margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
                    >
                      <XAxis dataKey="label" />
                      <YAxis
                        tickFormatter={(v) =>
                          v >= 1000 ? `R$ ${v / 1000}k` : `R$ ${v}`
                        }
                      />
                      <Tooltip
                        cursor={false}
                        contentStyle={{
                          backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
                          border: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e5e5e5'}`,
                          borderRadius: '0.5rem',
                          color: theme === 'dark' ? '#ffffff' : '#111827',
                          padding: '0.75rem',
                        }}
                        formatter={(value: number | undefined) =>
                          value != null
                            ? currencyFormatter.format(value)
                            : ''
                        }
                      />
                      <Legend />
                      <Bar dataKey="incomes" name="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenses" name="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </ChartCardFull>
          </ChartSection>

          <ChartSection aria-labelledby="chart-investments-title">
            <SectionTitle id="chart-investments-title">
              Investimentos
            </SectionTitle>
            <ChartsGrid>
              {isLoadingInvestments ? (
                <>
                  <Skeleton className="h-72 w-full" />
                  <Skeleton className="h-72 w-full" />
                </>
              ) : investmentData ? (
                <>
                  <ChartCard>
                    <ChartContainer>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={investmentData.evolution}
                          margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
                        >
                          <XAxis dataKey="month" />
                          <YAxis
                            tickFormatter={(v) =>
                              v >= 1000 ? `R$ ${v / 1000}k` : `R$ ${v}`
                            }
                          />
                          <Tooltip
                            cursor={false}
                            contentStyle={{
                              backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
                              border: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e5e5e5'}`,
                              borderRadius: '0.5rem',
                              color: theme === 'dark' ? '#ffffff' : '#111827',
                              padding: '0.75rem',
                            }}
                            formatter={(value: number | undefined) =>
                              value != null
                                ? currencyFormatter.format(value)
                                : ''
                            }
                          />
                          <Bar
                            dataKey="portfolioValue"
                            name="Valor do portfólio"
                            fill="#3b82f6"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </ChartCard>
                </>
              ) : (
                <ChartCard>
                  <p className="text-sm text-muted-foreground">
                    Sem dados de investimentos.
                  </p>
                </ChartCard>
              )}
            </ChartsGrid>
          </ChartSection>

          <InsightsSection aria-labelledby="insights-title">
            <SectionTitle id="insights-title">Sugestões e insights</SectionTitle>
            {isLoadingInsights ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : insights.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum insight no momento. Continue registrando gastos e
                receitas para receber sugestões.
              </p>
            ) : (
              <InsightsList role="list">
                {insights.map((insight, index) => (
                  <InsightCard
                    key={index}
                    $severity={insight.severity}
                    role="listitem"
                  >
                    <div className="flex gap-2">
                      <span className="shrink-0 mt-0.5" aria-hidden>
                        {insight.severity === 'error' && (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                        {insight.severity === 'warning' && (
                          <AlertTriangle className="h-5 w-5 text-amber-500" />
                        )}
                        {insight.severity === 'success' && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        {(insight.severity === 'info' || !insight.severity) && (
                          <Info className="h-5 w-5 text-blue-500" />
                        )}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{insight.message}</p>
                        {insight.suggestion && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {insight.suggestion}
                          </p>
                        )}
                      </div>
                    </div>
                  </InsightCard>
                ))}
              </InsightsList>
            )}
          </InsightsSection>
        </AnalyticsContent>
      </AnalyticsMain>
    </AnalyticsWrapper>
  );
}
