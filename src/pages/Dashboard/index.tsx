import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
  MoreVertical,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Header } from '../../components/Header';
import { CategoryTooltip } from '@/components/Tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { AddIncomeModal } from '../../components/AddIncomeModal';
import { AddExpenseModal } from '../../components/AddExpenseModal';
import { incomesService } from '../../services/incomes.service';
import { expensesService } from '../../services/expenses.service';
import { IconRenderer } from '../../utils/iconMapper';
import {
  DashboardWrapper,
  DashboardMain,
  DashboardContent,
  WelcomeSection,
  WelcomeTitle,
  PeriodSelector,
  PeriodButton,
  PeriodSelectButton,
  PeriodSelectWrapper,
  DatePickerTriggerButton,
  ClearDateRangeButton,
  ViewMoreButtonContainer,
  StatsGrid,
  StatCard,
  StatCardHeader,
  StatCardTitle,
  StatCardValue,
  StatCardChange,
  ActionCardsGrid,
  ActionCard,
  ActionCardIcon,
  ActionCardTitle,
  ActionCardDescription,
  BottomSection,
  ExpensesByCategoryCard,
  CategoryChartContainer,
  CategoryLegend,
  CategoryItem,
  CategoryIcon,
  CategoryInfo,
  CategoryPercentage,
  TransactionsCard,
  TransactionsTable,
  TableHeader,
  TableRow,
  TransactionCell,
  TransactionDescription,
  TransactionMethod,
  TransactionDate,
  TransactionAmount,
  TransactionActions,
  TableEmptyCell,
  EmptyStateText,
  TransactionCellContent,
  TransactionPaid,
  TransactionsCardMobile,
  TransactionsList,
  TransactionItem,
} from './styles';


type Period = 'this-month' | 'last-month' | 'this-year' | 'last-12-months';

export function Dashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState<Period | undefined>(
    undefined,
  );
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isAddIncomeModalOpen, setIsAddIncomeModalOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [editingIncomeId, setEditingIncomeId] = useState<string | null>(null);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [showDeleteGroupDialog, setShowDeleteGroupDialog] = useState(false);
  const [pendingDeleteExpenseId, setPendingDeleteExpenseId] = useState<string | null>(null);
  const [pendingDeleteGroupId, setPendingDeleteGroupId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    balance: 0,
    balanceChange: 0,
    income: 0,
    incomeChange: 0,
    expense: 0,
    expenseChange: 0,
  });
  const [categories, setCategories] = useState<
    Array<{
      name: string;
      percentage: number;
      color: string;
      icon: string | null;
      value: number;
    }>
  >([]);
  const [transactions, setTransactions] = useState<
    Array<{
      id: string;
      description: string;
      categoryIcon: string;
      category: string;
      date: string;
      purchaseDate?: string | null;
      amount: number;
      is_paid?: boolean;
      type: 'income' | 'expense';
    }>
  >([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [isUntilTodayFilterActive, setIsUntilTodayFilterActive] = useState(false);
  const allTimeStartDate = new Date(2000, 0, 1, 12, 0, 0);

  const parseDateOnlyToLocalDate = (dateInput: string | Date): Date => {
    if (dateInput instanceof Date) {
      return new Date(
        dateInput.getFullYear(),
        dateInput.getMonth(),
        dateInput.getDate(),
        12,
        0,
        0,
      );
    }

    const safeDate = dateInput.includes('T')
      ? dateInput.split('T')[0]
      : dateInput;
    const [year, month, day] = safeDate.split('-').map(Number);

    if (!year || !month || !day) {
      return allTimeStartDate;
    }

    return new Date(year, month - 1, day, 12, 0, 0);
  };

  const applyUntilTodayFilter = async () => {
    try {
      const response = await incomesService.getFirstTransactionDate();
      const firstDate = response.data.date
        ? parseDateOnlyToLocalDate(response.data.date)
        : allTimeStartDate;

      setSelectedPeriod(undefined);
      setIsUntilTodayFilterActive(true);
      setDateRange({
        from: firstDate,
        to: new Date(),
      });
    } catch (error) {
      console.error('Erro ao buscar primeira transação:', error);
      setSelectedPeriod(undefined);
      setIsUntilTodayFilterActive(true);
      setDateRange({
        from: allTimeStartDate,
        to: new Date(),
      });
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const loadStats = useCallback(async () => {
    try {
      const response = await incomesService.getStats(
        selectedPeriod,
        dateRange?.from,
        dateRange?.to,
      );
      // Converter centavos para reais
      const statsInReais = {
        balance: response.data.balance / 100,
        balanceChange: response.data.balanceChange,
        income: response.data.income / 100,
        incomeChange: response.data.incomeChange,
        expense: response.data.expense / 100,
        expenseChange: response.data.expenseChange,
      };
      setStats(statsInReais);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }, [selectedPeriod, dateRange]);

  const loadCategories = useCallback(async () => {
    setIsLoadingCategories(true);
    try {
      const response = await expensesService.getByCategory(
        selectedPeriod,
        dateRange?.from,
        dateRange?.to,
      );
      // Converter centavos para reais
      const categoriesInReais = response.data.map((cat) => ({
        ...cat,
        value: cat.value / 100,
      }));
      setCategories(categoriesInReais);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  }, [selectedPeriod, dateRange]);

  const loadTransactions = useCallback(async () => {
    setIsLoadingTransactions(true);
    try {
      const response = await incomesService.getLatestTransactions(10);
      // Converter centavos para reais e formatar data sem problemas de timezone
      const transactionsInReais = response.data.map((trans) => {
        // Converter data YYYY-MM-DD para DD/MM/YYYY sem problemas de timezone
        const dateParts = trans.date.split('-');
        const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
        const formattedPurchaseDate = trans.purchaseDate
          ? (() => {
              const purchaseParts = trans.purchaseDate.split('-');
              return `${purchaseParts[2]}/${purchaseParts[1]}/${purchaseParts[0]}`;
            })()
          : null;

        return {
          id: trans.id,
          description: trans.description,
          categoryIcon: trans.categoryIcon,
          category: trans.category,
          date: formattedDate,
          purchaseDate: formattedPurchaseDate,
          amount: trans.amount / 100,
          type: trans.type,
          is_paid: trans.type === 'expense' ? trans.is_paid ?? false : undefined,
        };
      });
      setTransactions(transactionsInReais);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
      setTransactions([]);
    } finally {
      setIsLoadingTransactions(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      void loadStats();
      void loadCategories();
      void loadTransactions();
    }
  }, [isAuthenticated, isLoading, loadStats, loadCategories, loadTransactions]);

  const handleIncomeCreated = () => {
    loadStats();
    loadCategories();
    loadTransactions();
    setEditingIncomeId(null);
  };

  const handleEditIncome = (incomeId: string) => {
    setEditingIncomeId(incomeId);
    setIsAddIncomeModalOpen(true);
  };

  const handleDeleteIncome = async (incomeId: string) => {
    if (
      !confirm('Tem certeza que deseja excluir esta receita? Esta ação não pode ser desfeita.')
    ) {
      return;
    }

    try {
      await incomesService.delete(incomeId);
      loadStats();
      loadCategories();
      loadTransactions();
    } catch (error) {
      console.error('Erro ao excluir receita:', error);
      alert('Erro ao excluir receita. Tente novamente.');
    }
  };

  const handleExpenseCreated = () => {
    loadStats();
    loadCategories();
    loadTransactions();
    setEditingExpenseId(null);
  };

  const handleEditExpense = (expenseId: string) => {
    setEditingExpenseId(expenseId);
    setIsAddExpenseModalOpen(true);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      // Buscar a expense para verificar se tem groupId
      const expenseResponse = await expensesService.findOne(expenseId);
      const expense = expenseResponse.data;

      // Verificar se tem groupId (pode ser null, undefined ou string vazia)
      if (expense.groupId && expense.groupId.trim() !== '') {
        // Se tem groupId, mostrar diálogo perguntando se quer excluir todo o grupo
        setPendingDeleteExpenseId(expenseId);
        setPendingDeleteGroupId(expense.groupId);
        setShowDeleteGroupDialog(true);
      } else {
        // Se não tem groupId, excluir normalmente
        if (
          !confirm('Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita.')
        ) {
          return;
        }
        await expensesService.delete(expenseId);
        loadStats();
        loadCategories();
        loadTransactions();
      }
    } catch (error) {
      console.error('Erro ao excluir despesa:', error);
      alert('Erro ao excluir despesa. Tente novamente.');
    }
  };

  const handleDeleteGroupConfirm = async (deleteGroup: boolean) => {
    if (!pendingDeleteExpenseId) return;

    try {
      if (deleteGroup && pendingDeleteGroupId) {
        await expensesService.deleteGroup(pendingDeleteGroupId);
      } else {
        await expensesService.delete(pendingDeleteExpenseId);
      }
      loadStats();
      loadCategories();
      loadTransactions();
    } catch (error) {
      console.error('Erro ao excluir despesa:', error);
      alert('Erro ao excluir despesa. Tente novamente.');
    } finally {
      setShowDeleteGroupDialog(false);
      setPendingDeleteExpenseId(null);
      setPendingDeleteGroupId(null);
    }
  };

  if (isLoading) {
    return (
      <DashboardWrapper>
        <DashboardMain>
          <DashboardContent>
            <WelcomeTitle>Carregando...</WelcomeTitle>
          </DashboardContent>
        </DashboardMain>
      </DashboardWrapper>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
    <DashboardWrapper>
      <Header />
      <DashboardMain>
        <DashboardContent>
          <WelcomeSection>
            <WelcomeTitle>
              Olá, {user.name.split(' ')[0]}!
            </WelcomeTitle>
            <PeriodSelector>
              <PeriodButton
                $active={selectedPeriod === 'this-month'}
                onClick={() => {
                  setSelectedPeriod('this-month');
                  setIsUntilTodayFilterActive(false);
                  setDateRange(undefined);
                }}
              >
                Este mês
              </PeriodButton>
              <PeriodButton
                $active={selectedPeriod === 'last-month'}
                onClick={() => {
                  setSelectedPeriod('last-month');
                  setIsUntilTodayFilterActive(false);
                  setDateRange(undefined);
                }}
              >
                Mês passado
              </PeriodButton>
              <PeriodButton
                $active={selectedPeriod === 'this-year'}
                onClick={() => {
                  setSelectedPeriod('this-year');
                  setIsUntilTodayFilterActive(false);
                  setDateRange(undefined);
                }}
              >
                Este ano
              </PeriodButton>
              <PeriodButton
                $active={isUntilTodayFilterActive}
                onClick={() => void applyUntilTodayFilter()}
              >
                Até hoje
              </PeriodButton>
              <PeriodSelectWrapper>
                <Popover>
                  <PopoverTrigger asChild>
                    <DatePickerTriggerButton type="button">
                      <PeriodSelectButton
                        type="button"
                        $active={!!dateRange?.from && !!dateRange?.to}
                      >
                        <CalendarIcon size={16} />
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
                        setIsUntilTodayFilterActive(false);
                        if (range?.from && range?.to) {
                          setSelectedPeriod(undefined);
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
                    onClick={() => {
                      setDateRange(undefined);
                      setIsUntilTodayFilterActive(false);
                    }}
                    aria-label="Limpar filtro de datas"
                  >
                    <X size={16} />
                  </ClearDateRangeButton>
                )}
              </PeriodSelectWrapper>
            </PeriodSelector>
          </WelcomeSection>

          <StatsGrid>
            <StatCard>
              <StatCardHeader>
                <StatCardTitle>Balanço</StatCardTitle>
                <StatCardChange $positive={stats.balanceChange >= 0}>
                  {stats.balanceChange >= 0 ? (
                    <TrendingUp size={14} />
                  ) : (
                    <TrendingDown size={14} />
                  )}
                  {stats.balanceChange >= 0 ? '+' : ''}
                  {stats.balanceChange}%
                </StatCardChange>
              </StatCardHeader>
              <StatCardValue $positive={stats.balance >= 0}>
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(stats.balance)}
              </StatCardValue>
            </StatCard>

            <StatCard>
              <StatCardHeader>
                <StatCardTitle>Receitas</StatCardTitle>
                <StatCardChange $positive={stats.incomeChange >= 0}>
                  {stats.incomeChange >= 0 ? (
                    <TrendingUp size={14} />
                  ) : (
                    <TrendingDown size={14} />
                  )}
                  {stats.incomeChange >= 0 ? '+' : ''}
                  {stats.incomeChange}%
                </StatCardChange>
              </StatCardHeader>
              <StatCardValue $positive={true}>
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(stats.income)}
              </StatCardValue>
            </StatCard>

            <StatCard>
              <StatCardHeader>
                <StatCardTitle>Despesas</StatCardTitle>
                <StatCardChange $positive={stats.expenseChange <= 0}>
                  {stats.expenseChange >= 0 ? (
                    <TrendingUp size={14} />
                  ) : (
                    <TrendingDown size={14} />
                  )}
                  {stats.expenseChange >= 0 ? '+' : ''}
                  {stats.expenseChange}%
                </StatCardChange>
              </StatCardHeader>
              <StatCardValue $positive={false}>
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(stats.expense)}
              </StatCardValue>
            </StatCard>
          </StatsGrid>

          <ActionCardsGrid>
            <ActionCard
              type="button"
              onClick={() => setIsAddIncomeModalOpen(true)}
            >
              <ActionCardIcon $color="#4ade80">
                <Plus size={24} />
              </ActionCardIcon>
              <div>
                <ActionCardTitle>Adicionar receita</ActionCardTitle>
                <ActionCardDescription>
                  Criar uma receita manualmente
                </ActionCardDescription>
              </div>
            </ActionCard>

            <ActionCard
              type="button"
              onClick={() => setIsAddExpenseModalOpen(true)}
            >
              <ActionCardIcon $color="#ef4444">
                <Minus size={24} />
              </ActionCardIcon>
              <div>
                <ActionCardTitle>Adicionar despesa</ActionCardTitle>
                <ActionCardDescription>
                  Criar uma despesa manualmente
                </ActionCardDescription>
              </div>
            </ActionCard>
          </ActionCardsGrid>

          <BottomSection>
            <ExpensesByCategoryCard>
              <h2>Despesas por categoria</h2>
              {categories.length > 0 ? (
                <CategoryChartContainer>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip content={<CategoryTooltip />} />
                      <Pie
                        data={categories}
                        cx="50%"
                        cy="50%"
                        innerRadius="60%"
                        outerRadius="90%"
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {categories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </CategoryChartContainer>
              ) : (
                <EmptyStateText>
                  {selectedPeriod
                    ? `Nenhuma despesa encontrada para ${selectedPeriod === 'this-month'
                      ? 'este mês'
                      : selectedPeriod === 'last-month'
                        ? 'o mês passado'
                        : selectedPeriod === 'this-year'
                          ? 'este ano'
                          : 'os últimos 12 meses'
                    }`
                    : 'Nenhuma despesa encontrada'}
                </EmptyStateText>
              )}
              <CategoryLegend>
                {isLoadingCategories ? (
                  <>
                    {[...Array(5)].map((_, index) => (
                      <CategoryItem key={`skeleton-${index}`}>
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <CategoryInfo>
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-12" />
                        </CategoryInfo>
                      </CategoryItem>
                    ))}
                  </>
                ) : categories.length > 0 ? (
                  categories.map((category) => (
                    <CategoryItem key={category.name}>
                      <CategoryIcon $color={category.color}>
                        <IconRenderer
                          iconName={category.icon}
                          size={20}
                          fallback={<span>📁</span>}
                        />
                      </CategoryIcon>
                      <CategoryInfo>
                        <span>{category.name}</span>
                        <CategoryPercentage>
                          {category.percentage.toFixed(2)}%
                        </CategoryPercentage>
                      </CategoryInfo>
                    </CategoryItem>
                  ))
                ) : null}
              </CategoryLegend>
            </ExpensesByCategoryCard>

            <TransactionsCard>
              <div>
                <h2>Últimas transações</h2>
                <p>Verifique suas últimas transações</p>
              </div>
              <TransactionsTable>
                <TableHeader>
                  <tr>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th>Data de Compra</th>
                    <th>Data de Pagamento</th>
                    <th>Valor</th>
                    <th>Pago</th>
                    <th></th>
                  </tr>
                </TableHeader>
                <tbody>
                  {isLoadingTransactions ? (
                    <>
                      {[...Array(5)].map((_, index) => (
                        <TableRow key={`skeleton-${index}`}>
                          <TransactionCell>
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <Skeleton className="h-4 w-32 ml-3" />
                          </TransactionCell>
                          <TransactionCell>
                            <Skeleton className="h-4 w-24" />
                          </TransactionCell>
                          <TransactionCell>
                            <Skeleton className="h-4 w-20" />
                          </TransactionCell>
                          <TransactionCell>
                            <Skeleton className="h-4 w-20" />
                          </TransactionCell>
                          <TransactionCell>
                            <Skeleton className="h-4 w-16" />
                          </TransactionCell>
                          <TransactionCell>
                            <Skeleton className="h-4 w-4 rounded" />
                          </TransactionCell>
                          <TransactionCell>
                            <Skeleton className="h-4 w-4 rounded" />
                          </TransactionCell>
                        </TableRow>
                      ))}
                    </>
                  ) : transactions.length > 0 ? (
                    transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TransactionCell>
                          <TransactionCellContent>
                            <CategoryIcon>
                              <IconRenderer
                                iconName={transaction.categoryIcon}
                                size={20}
                                color="currentColor"
                                fallback={<span>📁</span>}
                              />
                            </CategoryIcon>
                            <TransactionDescription>
                              {transaction.description}
                            </TransactionDescription>
                          </TransactionCellContent>
                        </TransactionCell>
                        <TransactionCell>
                          <TransactionMethod>
                            {transaction.category}
                          </TransactionMethod>
                        </TransactionCell>
                        <TransactionCell>
                          <TransactionDate>
                            {transaction.type === 'expense' && transaction.purchaseDate
                              ? transaction.purchaseDate
                              : transaction.date}
                          </TransactionDate>
                        </TransactionCell>
                        <TransactionCell>
                          <TransactionDate>
                            {transaction.date}
                          </TransactionDate>
                        </TransactionCell>
                        <TransactionCell>
                          <TransactionAmount $type={transaction.type}>
                            {transaction.type === 'income' ? '+' : '-'}
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(Math.abs(transaction.amount))}
                          </TransactionAmount>
                        </TransactionCell>
                        <TransactionCell>
                          <TransactionPaid $is_paid={transaction.is_paid} $type={transaction.type}>
                            {transaction.type === 'expense'
                              ? transaction.is_paid
                                ? 'Sim'
                                : 'Não'
                              : '-'}
                          </TransactionPaid>
                        </TransactionCell>
                        <TransactionCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <TransactionActions
                                type="button"
                                aria-label="Mais opções"
                              >
                                <MoreVertical size={16} />
                              </TransactionActions>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  transaction.type === 'income'
                                    ? handleEditIncome(transaction.id)
                                    : handleEditExpense(transaction.id)
                                }
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() =>
                                  transaction.type === 'income'
                                    ? handleDeleteIncome(transaction.id)
                                    : handleDeleteExpense(transaction.id)
                                }
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TransactionCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableEmptyCell colSpan={5}>
                        <EmptyStateText>
                          Nenhuma transação encontrada
                        </EmptyStateText>
                      </TableEmptyCell>
                    </TableRow>
                  )}
                </tbody>
              </TransactionsTable>
              {transactions.length > 0 && (
                <ViewMoreButtonContainer $theme={theme}>
                  <PeriodButton
                    type="button"
                    $active={false}
                    onClick={() => navigate('/transactions')}
                  >
                    Ver mais
                  </PeriodButton>
                </ViewMoreButtonContainer>
              )}
            </TransactionsCard>

            <TransactionsCardMobile>
              <div>
                <h2>Últimas transações</h2>
                <p>Verifique suas últimas transações</p>
              </div>

              <TransactionsList>
                {isLoadingTransactions ? (
                  <>
                    {[...Array(5)].map((_, index) => (
                      <TransactionItem key={`skeleton-${index}`}>
                        <div className="flex flex-col gap-2 flex-1">
                          <div className="flex gap-2">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex flex-col gap-2 flex-1">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-4 w-24" />
                            </div>
                          </div>
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="flex flex-col gap-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-20" />
                          </div>
                          <Skeleton className="h-8 w-8 rounded" />
                        </div>
                      </TransactionItem>
                    ))}
                  </>
                ) : transactions.length > 0 ? (
                  transactions.map((transaction) => (
                  <TransactionItem key={transaction.id} className="justify-between">
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        {transaction.categoryIcon && (
                          <CategoryIcon>
                            <IconRenderer
                              iconName={transaction.categoryIcon}
                              size={20}
                              color="currentColor"
                              fallback={<span>📁</span>}
                            />
                          </CategoryIcon>
                        )}
                        <div className="flex flex-col">
                          <TransactionDescription>
                            {transaction.description}
                          </TransactionDescription>
                          <TransactionMethod>
                            {transaction.category}
                          </TransactionMethod>
                        </div>
                      </div>
                      <TransactionDate>
                        {transaction.date}
                      </TransactionDate>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="flex flex-col self-start">
                        <TransactionAmount $type={transaction.type}>
                          {transaction.type === 'income' ? '+' : '-'}
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(Math.abs(transaction.amount))}
                        </TransactionAmount>

                        <TransactionPaid $is_paid={transaction.is_paid} $type={transaction.type}>
                          <span>Pago:</span> {transaction.is_paid ? 'Sim' : 'Não'}
                        </TransactionPaid>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <TransactionActions
                            type="button"
                            aria-label="Mais opções"
                          >
                            <MoreVertical size={20} />
                          </TransactionActions>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              transaction.type === 'income'
                                ? handleEditIncome(transaction.id)
                                : handleEditExpense(transaction.id)
                            }
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() =>
                              transaction.type === 'income'
                                ? handleDeleteIncome(transaction.id)
                                : handleDeleteExpense(transaction.id)
                            }
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TransactionItem>
                  ))
                ) : (
                  <TransactionItem>
                    <EmptyStateText>
                      Nenhuma transação encontrada
                    </EmptyStateText>
                  </TransactionItem>
                )}
              </TransactionsList>
            </TransactionsCardMobile>
          </BottomSection>
        </DashboardContent>
      </DashboardMain>
      <AddIncomeModal
        open={isAddIncomeModalOpen}
        onOpenChange={(open) => {
          setIsAddIncomeModalOpen(open);
          if (!open) {
            setEditingIncomeId(null);
          }
        }}
        onSuccess={handleIncomeCreated}
        incomeId={editingIncomeId}
      />
      <AddExpenseModal
        open={isAddExpenseModalOpen}
        onOpenChange={(open) => {
          setIsAddExpenseModalOpen(open);
          if (!open) {
            setEditingExpenseId(null);
          }
        }}
        onSuccess={handleExpenseCreated}
        expenseId={editingExpenseId}
      />
    </DashboardWrapper>

    <AlertDialog open={showDeleteGroupDialog} onOpenChange={setShowDeleteGroupDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir grupo de despesas</AlertDialogTitle>
          <AlertDialogDescription>
            Esta despesa faz parte de um grupo parcelado. Deseja excluir apenas esta parcela ou todo o grupo?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => handleDeleteGroupConfirm(false)}>
            Apenas esta parcela
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => handleDeleteGroupConfirm(true)}>
            Todo o grupo
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
