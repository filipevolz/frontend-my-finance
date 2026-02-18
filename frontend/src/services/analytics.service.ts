import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subWeeks,
  subMonths,
  subYears,
  format,
  parseISO,
  isWithinInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  getWeek,
  getYear,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { incomesService } from './incomes.service';
import { expensesService } from './expenses.service';

export type AnalyticsPeriod = 'week' | 'month' | 'year' | 'custom';

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export interface PeriodRange {
  startDate: Date;
  endDate: Date;
}

export interface AggregatedPeriod {
  label: string;
  periodKey: string;
  expenses: number;
  incomes: number;
  balance: number;
  startDate: Date;
  endDate: Date;
}

export interface CategoryStats {
  name: string;
  value: number;
  percentage: number;
  color: string;
  icon: string | null;
}

export interface Insight {
  type: 'excessive_spending' | 'savings_opportunity' | 'above_average' | 'allocation_suggestion' | 'positive';
  message: string;
  severity: 'info' | 'warning' | 'success' | 'error';
  category?: string;
  value?: number;
  suggestion?: string;
}

function getWeekRange(date: Date): PeriodRange {
  return {
    startDate: startOfWeek(date, { weekStartsOn: 0 }),
    endDate: endOfWeek(date, { weekStartsOn: 0 }),
  };
}

function getMonthRange(date: Date): PeriodRange {
  return {
    startDate: startOfMonth(date),
    endDate: endOfMonth(date),
  };
}

function getYearRange(date: Date): PeriodRange {
  return {
    startDate: startOfYear(date),
    endDate: endOfYear(date),
  };
}

/**
 * Retorna o intervalo de datas para o período selecionado.
 */
export function getPeriodRange(
  period: AnalyticsPeriod,
  dateRange?: DateRange | undefined
): PeriodRange {
  const now = new Date();

  if (period === 'custom' && dateRange?.from && dateRange?.to) {
    return {
      startDate: dateRange.from,
      endDate: dateRange.to,
    };
  }

  switch (period) {
    case 'week':
      return getWeekRange(now);
    case 'month':
      return getMonthRange(now);
    case 'year':
      return getYearRange(now);
    default:
      return getMonthRange(now);
  }
}

/**
 * Retorna o intervalo do período anterior (mesma duração).
 */
export function getPreviousPeriodRange(
  period: AnalyticsPeriod,
  dateRange?: DateRange | undefined
): PeriodRange {
  const current = getPeriodRange(period, dateRange);

  if (period === 'week') {
    const prevStart = subWeeks(current.startDate, 1);
    return { startDate: prevStart, endDate: endOfWeek(prevStart, { weekStartsOn: 0 }) };
  }
  if (period === 'month') {
    const prevStart = subMonths(current.startDate, 1);
    return { startDate: prevStart, endDate: endOfMonth(prevStart) };
  }
  if (period === 'year') {
    const prevStart = subYears(current.startDate, 1);
    return { startDate: prevStart, endDate: endOfYear(prevStart) };
  }
  if (period === 'custom' && dateRange?.from && dateRange?.to) {
    const durationMs = dateRange.to.getTime() - dateRange.from.getTime();
    const prevEnd = new Date(dateRange.from.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - durationMs);
    return { startDate: prevStart, endDate: prevEnd };
  }

  return current;
}

/**
 * Converte AnalyticsPeriod + dateRange para parâmetros do backend (period ou startDate/endDate).
 */
function toBackendParams(
  period: AnalyticsPeriod,
  dateRange?: DateRange | undefined
): { period?: 'this-month' | 'last-month' | 'this-year' | 'last-12-months'; startDate?: Date; endDate?: Date } {
  const range = getPeriodRange(period, dateRange);

  if (period === 'custom' || (dateRange?.from && dateRange?.to)) {
    return { startDate: range.startDate, endDate: range.endDate };
  }

  const now = new Date();
  if (period === 'week') {
    return { startDate: range.startDate, endDate: range.endDate };
  }
  if (period === 'month') {
    const isThisMonth =
      range.startDate.getMonth() === now.getMonth() &&
      range.startDate.getFullYear() === now.getFullYear();
    return isThisMonth
      ? { period: 'this-month' }
      : { startDate: range.startDate, endDate: range.endDate };
  }
  if (period === 'year') {
    const isThisYear = range.startDate.getFullYear() === now.getFullYear();
    return isThisYear
      ? { period: 'this-year' }
      : { startDate: range.startDate, endDate: range.endDate };
  }

  return { startDate: range.startDate, endDate: range.endDate };
}

/**
 * Busca estatísticas do período atual (receitas, despesas, saldo).
 */
export async function fetchStats(
  period: AnalyticsPeriod,
  dateRange?: DateRange | undefined
): Promise<{ income: number; expense: number; balance: number; incomeChange: number; expenseChange: number; balanceChange: number }> {
  const params = toBackendParams(period, dateRange);
  const [current, prevRange] = await Promise.all([
    incomesService.getStats(
      params.period,
      params.startDate,
      params.endDate
    ),
    Promise.resolve(getPreviousPeriodRange(period, dateRange)),
  ]);

  const income = current.data.income / 100;
  const expense = current.data.expense / 100;
  const balance = current.data.balance / 100;

  const prevParams = period === 'custom' && dateRange?.from && dateRange?.to
    ? { startDate: prevRange.startDate, endDate: prevRange.endDate }
    : { startDate: prevRange.startDate, endDate: prevRange.endDate };

  let incomeChange = current.data.incomeChange;
  let expenseChange = current.data.expenseChange;
  let balanceChange = current.data.balanceChange;

  try {
    const prevStats = await incomesService.getStats(
      undefined,
      prevParams.startDate,
      prevParams.endDate
    );
    const prevIncome = prevStats.data.income / 100;
    const prevExpense = prevStats.data.expense / 100;
    const prevBalance = prevStats.data.balance / 100;
    if (prevIncome > 0) {
      incomeChange = ((income - prevIncome) / prevIncome) * 100;
    }
    if (prevExpense > 0) {
      expenseChange = ((expense - prevExpense) / prevExpense) * 100;
    }
    if (prevBalance !== 0) {
      balanceChange = ((balance - prevBalance) / Math.abs(prevBalance)) * 100;
    } else if (balance !== 0) {
      balanceChange = balance > 0 ? 100 : -100;
    }
  } catch {
    // manter change do backend se falhar busca do período anterior
  }

  return {
    income,
    expense,
    balance,
    incomeChange,
    expenseChange,
    balanceChange,
  };
}

/**
 * Busca gastos por categoria para o período.
 */
export async function fetchExpensesByCategory(
  period: AnalyticsPeriod,
  dateRange?: DateRange | undefined
): Promise<CategoryStats[]> {
  const params = toBackendParams(period, dateRange);
  const response = await expensesService.getByCategory(
    params.period,
    params.startDate,
    params.endDate
  );
  return response.data.map((cat) => ({
    name: cat.name,
    value: cat.value / 100,
    percentage: cat.percentage,
    color: cat.color,
    icon: cat.icon,
  }));
}

/**
 * Agrega transações por semana ou mês para gráficos temporais.
 */
export function aggregateTransactionsByPeriod(
  transactions: Array<{ date: string; amount: number; type: 'income' | 'expense' }>,
  period: 'week' | 'month',
  range: PeriodRange
): AggregatedPeriod[] {
  const isWeek = period === 'week';
  const intervals = isWeek
    ? eachWeekOfInterval({ start: range.startDate, end: range.endDate }, { weekStartsOn: 0 })
    : eachMonthOfInterval({ start: range.startDate, end: range.endDate });

  const map = new Map<
    string,
    { expenses: number; incomes: number; intervalStart?: Date }
  >();

  intervals.forEach((d) => {
    const key = isWeek
      ? `W${String(getWeek(d, { weekStartsOn: 0 })).padStart(2, '0')}-${getYear(d)}`
      : format(d, 'yyyy-MM');
    map.set(key, {
      expenses: 0,
      incomes: 0,
      ...(isWeek && { intervalStart: d }),
    });
  });

  transactions.forEach((t) => {
    const date = parseISO(t.date);
    if (!isWithinInterval(date, { start: range.startDate, end: range.endDate })) return;

    const key = isWeek
      ? `W${String(getWeek(date, { weekStartsOn: 0 })).padStart(2, '0')}-${getYear(date)}`
      : format(date, 'yyyy-MM');

    if (!map.has(key)) {
      map.set(key, { expenses: 0, incomes: 0 });
    }
    const entry = map.get(key)!;
    if (t.type === 'expense') {
      entry.expenses += t.amount / 100;
    } else {
      entry.incomes += t.amount / 100;
    }
  });

  return Array.from(map.entries())
    .map(([periodKey, data]) => {
      const label = isWeek
        ? `Sem. ${periodKey.replace('W', '')}`
        : format(parseISO(periodKey + '-01'), 'MMM yyyy', { locale: ptBR });
      const startDate =
        isWeek && data.intervalStart
          ? data.intervalStart
          : parseISO(periodKey + '-01');
      const endDate = isWeek
        ? endOfWeek(startDate, { weekStartsOn: 0 })
        : endOfMonth(startDate);

      return {
        label,
        periodKey,
        expenses: data.expenses,
        incomes: data.incomes,
        balance: data.incomes - data.expenses,
        startDate,
        endDate,
      };
    })
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}

/**
 * Busca transações e retorna agregadas por período para gráficos.
 */
export async function fetchTimeSeriesData(
  period: AnalyticsPeriod,
  dateRange: DateRange | undefined,
  granularity: 'week' | 'month'
): Promise<AggregatedPeriod[]> {
  const range = getPeriodRange(period, dateRange);
  const filters: { startDate: Date; endDate: Date; type?: 'income' | 'expense' } = {
    startDate: range.startDate,
    endDate: range.endDate,
  };

  const [incomeRes, expenseRes] = await Promise.all([
    incomesService.getTransactions({
      ...filters,
      type: 'income',
    }),
    incomesService.getTransactions({
      ...filters,
      type: 'expense',
    }),
  ]);

  const all = [
    ...incomeRes.data.map((t) => ({ date: t.date, amount: t.amount, type: 'income' as const })),
    ...expenseRes.data.map((t) => ({ date: t.date, amount: t.amount, type: 'expense' as const })),
  ];

  return aggregateTransactionsByPeriod(all, granularity, range);
}

/**
 * Dados para comparação mês a mês (últimos N meses).
 */
export async function fetchMonthlyComparison(months: number = 6): Promise<AggregatedPeriod[]> {
  const end = endOfMonth(new Date());
  const start = subMonths(startOfMonth(new Date()), months - 1);
  const range: PeriodRange = { startDate: start, endDate: end };
  const filters = { startDate: start, endDate: end };

  const [incomeRes, expenseRes] = await Promise.all([
    incomesService.getTransactions({ ...filters, type: 'income' }),
    incomesService.getTransactions({ ...filters, type: 'expense' }),
  ]);

  const all = [
    ...incomeRes.data.map((t) => ({ date: t.date, amount: t.amount, type: 'income' as const })),
    ...expenseRes.data.map((t) => ({ date: t.date, amount: t.amount, type: 'expense' as const })),
  ];

  return aggregateTransactionsByPeriod(all, 'month', range);
}

/**
 * Busca investimentos da categoria "Investimentos" nas despesas.
 */
export async function fetchInvestmentData(): Promise<{
  totalInvested: number;
  totalValue: number;
  totalProfit: number;
  profitPercentage: number;
  evolution: Array<{ month: string; portfolioValue: number }>;
  byAssetClass: Array<{ name: string; value: number }>;
}> {
  try {
    // Buscar todas as despesas da categoria "Investimentos"
    // Para investimentos, sempre buscar do último ano para ter histórico completo
    const range = getPeriodRange('year', undefined);
    const filters = {
      startDate: range.startDate,
      endDate: range.endDate,
    };
    
    // Buscar transações de despesas e filtrar investimentos
    const expenseTransactions = await incomesService.getTransactions({
      ...filters,
      type: 'expense',
    });
    
    // Filtrar apenas investimentos
    const investmentExpenses = expenseTransactions.data.filter(
      (t) => t.category === 'Investimentos'
    );

    // Calcular total investido (soma de todas as despesas de investimento)
    const totalInvested = investmentExpenses.reduce(
      (sum, exp) => sum + exp.amount,
      0
    ); // Já está em centavos, vamos converter depois

    // Converter para reais
    const totalInvestedReais = totalInvested / 100;
    
    // Para investimentos cadastrados como despesas, assumimos que o valor atual é igual ao investido
    // (não temos como calcular lucro/prejuízo sem dados de mercado)
    const totalValue = totalInvestedReais;
    const totalProfit = 0;
    const profitPercentage = 0;

    // Agregar por mês para evolução
    const monthlyMap = new Map<string, number>();
    investmentExpenses.forEach((exp) => {
      const date = parseISO(exp.date);
      const monthKey = format(date, 'yyyy-MM');
      const existing = monthlyMap.get(monthKey) || 0;
      monthlyMap.set(monthKey, existing + exp.amount);
    });

    // Calcular valores acumulados
    const evolution: Array<{ month: string; portfolioValue: number }> = [];
    let cumulative = 0;
    const sortedMonths = Array.from(monthlyMap.entries()).sort();
    
    sortedMonths.forEach(([monthKey, value]) => {
      cumulative += value / 100; // Converter de centavos para reais
      evolution.push({
        month: format(parseISO(monthKey + '-01'), 'MMM/yy', { locale: ptBR }),
        portfolioValue: cumulative,
      });
    });

    // Por enquanto, não temos distribuição por classe de ativo
    // (seria necessário ter essa informação no nome ou notas da despesa)
    const byAssetClass: Array<{ name: string; value: number }> = [];

    return {
      totalInvested: totalInvestedReais,
      totalValue,
      totalProfit,
      profitPercentage,
      evolution,
      byAssetClass,
    };
  } catch (error) {
    console.error('Erro ao buscar investimentos:', error);
    return {
      totalInvested: 0,
      totalValue: 0,
      totalProfit: 0,
      profitPercentage: 0,
      evolution: [],
      byAssetClass: [],
    };
  }
}

/**
 * Gera insights com base em categorias atuais vs período anterior.
 */
export async function generateInsights(
  period: AnalyticsPeriod,
  dateRange: DateRange | undefined
): Promise<Insight[]> {
  const prevRange = getPreviousPeriodRange(period, dateRange);

  const paramsCurrent = toBackendParams(period, dateRange);
  const paramsPrev = {
    startDate: prevRange.startDate,
    endDate: prevRange.endDate,
  };

  const [currentCategories, prevCategories] = await Promise.all([
    expensesService.getByCategory(
      paramsCurrent.period,
      paramsCurrent.startDate,
      paramsCurrent.endDate
    ),
    expensesService.getByCategory(
      undefined,
      paramsPrev.startDate,
      paramsPrev.endDate
    ),
  ]);

  const insights: Insight[] = [];
  const prevMap = new Map(prevCategories.data.map((c) => [c.name, c]));
  
  // Filtrar investimentos dos cálculos de gastos (investimentos não são gastos)
  const expensesCategories = currentCategories.data.filter(
    (c) => c.name !== 'Investimentos'
  );
  const prevExpensesCategories = prevCategories.data.filter(
    (c) => c.name !== 'Investimentos'
  );
  
  const totalCurrent = expensesCategories.reduce((s, c) => s + c.value, 0);
  const totalPrev = prevExpensesCategories.reduce((s, c) => s + c.value, 0);

  // Gastos excessivos: categoria aumentou >20% (excluindo investimentos)
  expensesCategories.forEach((cat) => {
    const prev = prevMap.get(cat.name);
    if (!prev || prev.value === 0) return;
    const change = ((cat.value - prev.value) / prev.value) * 100;
    if (change > 20) {
      const valueReais = (cat.value / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });
      insights.push({
        type: 'excessive_spending',
        message: `Gastos em "${cat.name}" aumentaram ${change.toFixed(0)}% em relação ao período anterior (${valueReais}).`,
        severity: 'warning',
        category: cat.name,
        value: cat.value / 100,
        suggestion: 'Considere revisar gastos nesta categoria.',
      });
    }
  });

  // Acima da média: gasto total maior que período anterior
  if (totalPrev > 0 && totalCurrent > totalPrev) {
    const change = ((totalCurrent - totalPrev) / totalPrev) * 100;
    insights.push({
      type: 'above_average',
      message: `Seus gastos totais estão ${change.toFixed(0)}% acima do período anterior.`,
      severity: change > 30 ? 'error' : 'warning',
      suggestion: 'Revise categorias com maior peso para identificar onde reduzir.',
    });
  }

  // Oportunidade de economia: categorias que mais pesam (excluindo investimentos)
  const topCategories = expensesCategories.slice(0, 3);
  if (topCategories.length > 0 && totalCurrent > 0) {
    const main = topCategories[0];
    const pct = (main.value / totalCurrent) * 100;
    if (pct > 35) {
      const valueReais = (main.value / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });
      insights.push({
        type: 'savings_opportunity',
        message: `"${main.name}" representa ${pct.toFixed(0)}% dos seus gastos (${valueReais}). Pequenas reduções aqui podem gerar boa economia.`,
        severity: 'info',
        category: main.name,
        suggestion: 'Defina um teto para esta categoria no próximo período.',
      });
    }
  }

  // Positivo: gastos menores que período anterior
  if (totalPrev > 0 && totalCurrent < totalPrev) {
    const change = ((totalPrev - totalCurrent) / totalPrev) * 100;
    insights.push({
      type: 'positive',
      message: `Você gastou ${change.toFixed(0)}% a menos que no período anterior. Parabéns!`,
      severity: 'success',
    });
  }

  return insights;
}

export const analyticsService = {
  getPeriodRange,
  getPreviousPeriodRange,
  toBackendParams,
  fetchStats,
  fetchExpensesByCategory,
  aggregateTransactionsByPeriod,
  fetchTimeSeriesData,
  fetchMonthlyComparison,
  fetchInvestmentData,
  generateInsights,
};
