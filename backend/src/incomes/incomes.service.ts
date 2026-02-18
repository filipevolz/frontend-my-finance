import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Income } from './income.entity';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { ExpensesService } from '../expenses/expenses.service';
import { Expense } from '../expenses/expense.entity';
import { CategoriesService } from '../categories/categories.service';
import { CategoryType } from '../categories/category.entity';
import { dateOnlyToString } from 'src/helpers/dateOnlyToString';

@Injectable()
export class IncomesService {
  constructor(
    @InjectRepository(Income)
    private incomesRepository: Repository<Income>,
    @InjectRepository(Expense)
    private expensesRepository: Repository<Expense>,
    @Inject(forwardRef(() => ExpensesService))
    private expensesService: ExpensesService,
    private categoriesService: CategoriesService,
  ) {}

  // Função helper para normalizar texto (remover acentos e converter para minúsculas)
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  async create(
    userId: string,
    createIncomeDto: CreateIncomeDto,
  ): Promise<Income[]> {
    const { name, category, amount, date, isRecurring } = createIncomeDto;

    // Converter string YYYY-MM-DD para Date object sem problemas de timezone
    const dateStr = date.split('T')[0];
    const [year, month, day] = dateStr.split('-').map(Number);
    const baseDate = new Date(year, month - 1, day);

    if (isRecurring) {
      // Criar 12 receitas recorrentes (uma para cada mês)
      const recurringGroupId = uuidv4();
      const incomes: Income[] = [];

      for (let i = 0; i < 12; i++) {
        const incomeDate = new Date(year, month - 1 + i, day);

        const income = this.incomesRepository.create({
          userId,
          name,
          category,
          amount,
          date: incomeDate,
          isRecurring: true,
          recurringGroupId,
        });

        incomes.push(income);
      }

      return await this.incomesRepository.save(incomes);
    } else {
      // Criar uma única receita
      const income = this.incomesRepository.create({
        userId,
        name,
        category,
        amount,
        date: baseDate,
        isRecurring: false,
        recurringGroupId: null,
      });

      return [await this.incomesRepository.save(income)];
    }
  }

  async findAll(userId: string): Promise<Income[]> {
    return await this.incomesRepository.find({
      where: { userId },
      order: { date: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Income> {
    const income = await this.incomesRepository.findOne({
      where: { id },
    });

    if (!income) {
      throw new NotFoundException('Receita não encontrada');
    }

    if (income.userId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar esta receita',
      );
    }

    return income;
  }

  async update(
    id: string,
    userId: string,
    updateIncomeDto: UpdateIncomeDto,
  ): Promise<Income> {
    const income = await this.findOne(id, userId);

    // Se a receita for recorrente, atualizar apenas esta instância
    // (não afeta as outras receitas do grupo)
    Object.assign(income, updateIncomeDto);

    if (updateIncomeDto.date) {
      // Converter string YYYY-MM-DD para Date object sem problemas de timezone
      const dateStr = updateIncomeDto.date.split('T')[0];
      const [year, month, day] = dateStr.split('-').map(Number);
      income.date = new Date(year, month - 1, day);
    }

    return await this.incomesRepository.save(income);
  }

  async remove(id: string, userId: string): Promise<void> {
    const income = await this.findOne(id, userId);
    await this.incomesRepository.remove(income);
  }

  async findByCategory(userId: string, category: string): Promise<Income[]> {
    return await this.incomesRepository.find({
      where: { userId, category },
      order: { date: 'DESC' },
    });
  }

  async findByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Income[]> {
    // Formatar datas para YYYY-MM-DD (formato esperado pelo PostgreSQL date)
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const result = await this.incomesRepository
      .createQueryBuilder('income')
      .where('income.user_id = :userId', { userId })
      .andWhere('income.date >= :startDate', { startDate: startDateStr })
      .andWhere('income.date <= :endDate', { endDate: endDateStr })
      .orderBy('income.date', 'DESC')
      .getMany();

    // Verificar quantos registros existem para esse userId sem filtro de data
    const totalForUser = await this.incomesRepository.count({
      where: { userId },
    });

    return result;
  }

  async findByPeriod(
    userId: string,
    period: 'this-month' | 'last-month' | 'this-year' | 'last-12-months',
  ): Promise<Income[]> {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case 'this-month': {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        // Último dia do mês atual
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      }
      case 'last-month': {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        startDate = lastMonth;
        // Último dia do mês passado
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      }
      case 'this-year': {
        startDate = new Date(now.getFullYear(), 0, 1);
        // Último dia do ano atual
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      }
      case 'last-12-months': {
        startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        // Data atual (último dia do período)
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      }
    }

    // Ajustar para incluir todo o dia final
    endDate.setHours(23, 59, 59, 999);

    return await this.findByDateRange(userId, startDate, endDate);
  }

  async getStats(
    userId: string,
    period?: 'this-month' | 'last-month' | 'this-year' | 'last-12-months',
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    balance: number;
    balanceChange: number;
    income: number;
    incomeChange: number;
    expense: number;
    expenseChange: number;
  }> {
    // Buscar receitas do período atual
    let currentIncomes: Income[];
    if (startDate && endDate) {
      currentIncomes = await this.findByDateRange(userId, startDate, endDate);
    } else if (period) {
      currentIncomes = await this.findByPeriod(userId, period);
    } else {
      currentIncomes = await this.findAll(userId);
    }
    const currentIncome = currentIncomes.reduce(
      (sum, income) => sum + Number(income.amount),
      0,
    );

    // Se não houver período ou for range customizado, não calcular mudanças percentuais
    if (!period || (startDate && endDate)) {
      const currentExpense = await this.expensesService.getStats(
        userId,
        period,
        startDate,
        endDate,
      );
      const balance = currentIncome - currentExpense;
      return {
        balance,
        balanceChange: 0,
        income: currentIncome,
        incomeChange: 0,
        expense: currentExpense,
        expenseChange: 0,
      };
    }

    // Buscar receitas do período anterior para comparação
    let previousIncome = 0;
    let previousPeriod:
      | 'this-month'
      | 'last-month'
      | 'this-year'
      | 'last-12-months'
      | null = null;

    switch (period) {
      case 'this-month': {
        previousPeriod = 'last-month';
        break;
      }
      case 'last-month': {
        // Comparar com mês anterior ao last-month (2 meses atrás)
        const twoMonthsAgo = new Date();
        twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
        const previousMonthStart = new Date(
          twoMonthsAgo.getFullYear(),
          twoMonthsAgo.getMonth(),
          1,
        );
        const previousMonthEnd = new Date(
          twoMonthsAgo.getFullYear(),
          twoMonthsAgo.getMonth() + 1,
          0,
          23,
          59,
          59,
          999,
        );
        const previousMonthIncomes = await this.findByDateRange(
          userId,
          previousMonthStart,
          previousMonthEnd,
        );
        previousIncome = previousMonthIncomes.reduce(
          (sum, income) => sum + Number(income.amount),
          0,
        );
        break;
      }
      case 'this-year': {
        // Comparar com ano anterior
        const lastYear = new Date();
        lastYear.setFullYear(lastYear.getFullYear() - 1);
        const lastYearIncomes = await this.findByDateRange(
          userId,
          new Date(lastYear.getFullYear(), 0, 1),
          new Date(lastYear.getFullYear(), 11, 31, 23, 59, 59, 999),
        );
        previousIncome = lastYearIncomes.reduce(
          (sum, income) => sum + Number(income.amount),
          0,
        );
        break;
      }
      case 'last-12-months': {
        // Comparar com os 12 meses anteriores aos últimos 12 meses
        const now = new Date();
        const previous12MonthsStart = new Date(
          now.getFullYear(),
          now.getMonth() - 23,
          1,
        );
        const previous12MonthsEnd = new Date(
          now.getFullYear(),
          now.getMonth() - 12,
          0,
          23,
          59,
          59,
          999,
        );
        const previous12MonthsIncomes = await this.findByDateRange(
          userId,
          previous12MonthsStart,
          previous12MonthsEnd,
        );
        previousIncome = previous12MonthsIncomes.reduce(
          (sum, income) => sum + Number(income.amount),
          0,
        );
        break;
      }
    }

    if (previousPeriod) {
      const previousIncomes = await this.findByPeriod(userId, previousPeriod);
      previousIncome = previousIncomes.reduce(
        (sum, income) => sum + Number(income.amount),
        0,
      );
    }

    // Calcular percentual de mudança
    const incomeChange =
      previousIncome === 0
        ? currentIncome > 0
          ? 100
          : 0
        : ((currentIncome - previousIncome) / previousIncome) * 100;

    // Buscar despesas do período atual
    const currentExpense = await this.expensesService.getStats(userId, period);

    // Buscar despesas do período anterior
    let previousExpense = 0;
    if (previousPeriod) {
      previousExpense = await this.expensesService.getStats(
        userId,
        previousPeriod,
      );
    } else {
      // Para casos especiais (last-month, this-year, last-12-months)
      let previousStartDate: Date;
      let previousEndDate: Date;

      switch (period) {
        case 'last-month': {
          const twoMonthsAgo = new Date();
          twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
          previousStartDate = new Date(
            twoMonthsAgo.getFullYear(),
            twoMonthsAgo.getMonth(),
            1,
          );
          previousEndDate = new Date(
            twoMonthsAgo.getFullYear(),
            twoMonthsAgo.getMonth() + 1,
            0,
            23,
            59,
            59,
            999,
          );
          const previousExpenses = await this.expensesService.findByDateRange(
            userId,
            previousStartDate,
            previousEndDate,
          );
          previousExpense = previousExpenses.reduce(
            (sum, expense) => sum + Number(expense.amount),
            0,
          );
          break;
        }
        case 'this-year': {
          const lastYear = new Date();
          lastYear.setFullYear(lastYear.getFullYear() - 1);
          const lastYearExpenses = await this.expensesService.findByDateRange(
            userId,
            new Date(lastYear.getFullYear(), 0, 1),
            new Date(lastYear.getFullYear(), 11, 31, 23, 59, 59, 999),
          );
          previousExpense = lastYearExpenses.reduce(
            (sum, expense) => sum + Number(expense.amount),
            0,
          );
          break;
        }
        case 'last-12-months': {
          const now2 = new Date();
          const previous12MonthsStart = new Date(
            now2.getFullYear(),
            now2.getMonth() - 23,
            1,
          );
          const previous12MonthsEnd = new Date(
            now2.getFullYear(),
            now2.getMonth() - 12,
            0,
            23,
            59,
            59,
            999,
          );
          const previous12MonthsExpenses =
            await this.expensesService.findByDateRange(
              userId,
              previous12MonthsStart,
              previous12MonthsEnd,
            );
          previousExpense = previous12MonthsExpenses.reduce(
            (sum, expense) => sum + Number(expense.amount),
            0,
          );
          break;
        }
      }
    }

    // Calcular percentual de mudança de despesas
    const expenseChange =
      previousExpense === 0
        ? currentExpense > 0
          ? 100
          : 0
        : ((currentExpense - previousExpense) / previousExpense) * 100;

    // Balance é income - expense
    const balance = currentIncome - currentExpense;
    const previousBalance = previousIncome - previousExpense;
    const balanceChange =
      previousBalance === 0
        ? balance > 0
          ? 100
          : 0
        : ((balance - previousBalance) / previousBalance) * 100;

    return {
      balance,
      balanceChange: Math.round(balanceChange * 100) / 100,
      income: currentIncome,
      incomeChange: Math.round(incomeChange * 100) / 100,
      expense: currentExpense,
      expenseChange: Math.round(expenseChange * 100) / 100,
    };
  }

  async getLatestTransactions(
    userId: string,
    limit: number = 10,
  ): Promise<
    Array<{
      id: string;
      description: string;
      categoryIcon: string;
      category: string;
      date: string;
      purchaseDate?: string | null;
      amount: number;
      type: 'income' | 'expense';
      is_paid?: boolean;
    }>
  > {
    // Buscar todas as categorias para mapear ícones
    const allCategories = await this.categoriesService.findAll();
    const categoryMap = new Map<string, string>(
      allCategories
        .filter((cat) => cat.icon !== null)
        .map((cat) => [cat.name, cat.icon as string]),
    );

    // Buscar últimas receitas ordenadas por createdAt
    const incomes = await this.incomesRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });

    // Buscar últimas despesas ordenadas por createdAt
    const expenses = await this.expensesRepository
      .createQueryBuilder('expense')
      .where('expense.user_id = :userId', { userId })
      .orderBy('expense.created_at', 'DESC')
      .limit(limit)
      .getMany();

    // Converter para formato unificado
    const incomeTransactions = incomes.map((income) => {
      const dateStr = dateOnlyToString(income.date);
      const categoryIcon: string = categoryMap.get(income.category) || '💰';

      return {
        id: income.id,
        description: income.name || income.category, // Usar o nome do income ou categoria como fallback
        categoryIcon,
        category: income.category,
        date: dateStr,
        amount: Number(income.amount),
        type: 'income' as const,
        createdAt: income.createdAt,
      };
    });

    const expenseTransactions = expenses.map((expense) => {
      const dateStr = dateOnlyToString(expense.date);
      const purchaseDateStr = expense.purchaseDate 
        ? dateOnlyToString(expense.purchaseDate) 
        : null;
      const categoryIcon: string = categoryMap.get(expense.category) || '💰';

      return {
        id: expense.id,
        description: expense.name || expense.category, // Usar o nome do expense ou categoria como fallback
        categoryIcon,
        category: expense.category,
        date: dateStr, // Data de vencimento/pagamento (para filtros)
        purchaseDate: purchaseDateStr, // Data original da compra (para exibição)
        amount: Number(expense.amount),
        type: 'expense' as const,
        createdAt: expense.createdAt,
        is_paid: expense.is_paid,
      };
    });

    // Combinar e ordenar por createdAt (data de criação)
    const allTransactionsWithCreatedAt = [
      ...incomeTransactions,
      ...expenseTransactions,
    ];

    const allTransactions = allTransactionsWithCreatedAt
      .sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime(); // Mais recente primeiro
      })
      .slice(0, limit)
      .map(({ createdAt, ...trans }) => trans); // Remover createdAt do resultado final

    return allTransactions;
  }

  async getTransactions(
    userId: string,
    filters: {
      startDate?: Date;
      endDate?: Date;
      category?: string;
      minAmount?: number;
      maxAmount?: number;
      description?: string;
      period?: 'this-month' | 'last-month' | 'this-year' | 'last-12-months';
      month?: number;
      year?: number;
      type?: 'income' | 'expense';
    },
  ): Promise<
    Array<{
      id: string;
      description: string;
      categoryIcon: string;
      category: string;
      date: string;
      purchaseDate?: string | null;
      amount: number;
      type: 'income' | 'expense';
      is_paid?: boolean;
    }>
  > {
    // Buscar todas as categorias para mapear ícones
    const allCategories = await this.categoriesService.findAll();
    const categoryMap = new Map<string, string>(
      allCategories
        .filter((cat) => cat.icon !== null)
        .map((cat) => [cat.name, cat.icon as string]),
    );

    // Determinar range de datas
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (filters.startDate && filters.endDate) {
      startDate = filters.startDate;
      endDate = filters.endDate;
    } else if (filters.period) {
      const periodDates = this.getPeriodDates(filters.period);
      startDate = periodDates.startDate;
      endDate = periodDates.endDate;
    } else if (filters.month && filters.year) {
      startDate = new Date(filters.year, filters.month - 1, 1);
      endDate = new Date(filters.year, filters.month, 0, 23, 59, 59, 999);
    } else if (filters.year) {
      startDate = new Date(filters.year, 0, 1);
      endDate = new Date(filters.year, 11, 31, 23, 59, 59, 999);
    }

    // Buscar receitas
    let incomes: Income[] = [];
    if (!filters.type || filters.type === 'income') {
      const incomesQuery = this.incomesRepository
        .createQueryBuilder('income')
        .where('income.user_id = :userId', { userId });

      if (startDate && endDate) {
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];
        incomesQuery
          .andWhere('income.date >= :startDate', { startDate: startDateStr })
          .andWhere('income.date <= :endDate', { endDate: endDateStr });
      }

      if (filters.category) {
        incomesQuery.andWhere('income.category = :category', {
          category: filters.category,
        });
      }

      if (filters.minAmount !== undefined) {
        incomesQuery.andWhere('income.amount >= :minAmount', {
          minAmount: filters.minAmount,
        });
      }

      if (filters.maxAmount !== undefined) {
        incomesQuery.andWhere('income.amount <= :maxAmount', {
          maxAmount: filters.maxAmount,
        });
      }

      if (filters.description) {
        // Normalizar o texto de busca para ignorar acentos e case
        const normalizedSearch = this.normalizeText(filters.description);
        // Usar TRANSLATE para remover acentos de forma eficiente (função nativa do PostgreSQL)
        incomesQuery.andWhere(
          `LOWER(TRANSLATE(income.name, 'áàãâéêíóôõúüçÁÀÃÂÉÊÍÓÔÕÚÜÇ', 'aaaaeeiooouucAAAAEEIOOOUUC')) LIKE LOWER(:description)`,
          {
            description: `%${normalizedSearch}%`,
          },
        );
      }

      incomes = await incomesQuery
        .orderBy('income.date', 'ASC')
        .addOrderBy('income.created_at', 'ASC')
        .getMany();
    }

    // Buscar despesas
    let expenses: Expense[] = [];
    if (!filters.type || filters.type === 'expense') {
      const expensesQuery = this.expensesRepository
        .createQueryBuilder('expense')
        .where('expense.user_id = :userId', { userId });

      if (startDate && endDate) {
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];
        expensesQuery
          .andWhere('expense.date >= :startDate', { startDate: startDateStr })
          .andWhere('expense.date <= :endDate', { endDate: endDateStr });
      }

      if (filters.category) {
        expensesQuery.andWhere('expense.category = :category', {
          category: filters.category,
        });
      }

      if (filters.minAmount !== undefined) {
        expensesQuery.andWhere('expense.amount >= :minAmount', {
          minAmount: filters.minAmount,
        });
      }

      if (filters.maxAmount !== undefined) {
        expensesQuery.andWhere('expense.amount <= :maxAmount', {
          maxAmount: filters.maxAmount,
        });
      }

      if (filters.description) {
        // Normalizar o texto de busca para ignorar acentos e case
        const normalizedSearch = this.normalizeText(filters.description);
        // Buscar usando função que normaliza texto (remove acentos)
        // Usar translate para remover acentos de forma mais eficiente
        expensesQuery.andWhere(
          `LOWER(TRANSLATE(expense.name, 'áàãâéêíóôõúüçÁÀÃÂÉÊÍÓÔÕÚÜÇ', 'aaaaeeiooouucAAAAEEIOOOUUC')) LIKE LOWER(:description)`,
          {
            description: `%${normalizedSearch}%`,
          },
        );
      }

      expenses = await expensesQuery
        .orderBy('expense.date', 'ASC')
        .addOrderBy('expense.created_at', 'ASC')
        .getMany();
    }

    // Converter para formato unificado
    const incomeTransactions = incomes.map((income) => {
      const dateStr = dateOnlyToString(income.date);
      const categoryIcon: string = categoryMap.get(income.category) || '💰';

      return {
        id: income.id,
        description: income.name || income.category,
        categoryIcon,
        category: income.category,
        date: dateStr,
        amount: Number(income.amount),
        type: 'income' as const,
      };
    });

    const expenseTransactions = expenses.map((expense) => {
      const dateStr = dateOnlyToString(expense.date);
      const purchaseDateStr = expense.purchaseDate 
        ? dateOnlyToString(expense.purchaseDate) 
        : null;
      const categoryIcon: string = categoryMap.get(expense.category) || '💰';

      return {
        id: expense.id,
        description: expense.name || expense.category,
        categoryIcon,
        category: expense.category,
        date: dateStr, // Data de vencimento/pagamento (para filtros)
        purchaseDate: purchaseDateStr, // Data original da compra (para exibição)
        amount: Number(expense.amount),
        type: 'expense' as const,
        is_paid: expense.is_paid,
      };
    });

    // Combinar e ordenar por data (mais antiga primeiro)
    const allTransactions = [...incomeTransactions, ...expenseTransactions]
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        // Ordenar por data crescente (mais antiga primeiro)
        // Se as datas forem iguais, ordenar por ID para manter consistência
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA.getTime() - dateB.getTime();
        }
        return a.id.localeCompare(b.id);
      });

    return allTransactions;
  }

  private getPeriodDates(period: 'this-month' | 'last-month' | 'this-year' | 'last-12-months'): {
    startDate: Date;
    endDate: Date;
  } {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case 'this-month': {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      }
      case 'last-month': {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        startDate = lastMonth;
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      }
      case 'this-year': {
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      }
      case 'last-12-months': {
        startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      }
    }

    endDate.setHours(23, 59, 59, 999);
    return { startDate, endDate };
  }

}
