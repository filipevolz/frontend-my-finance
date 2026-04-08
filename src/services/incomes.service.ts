import { api } from './api';

export interface CreateIncomeRequest {
  name?: string;
  category: string;
  amount: number;
  date: string;
  isRecurring?: boolean;
}

export interface UpdateIncomeRequest {
  name?: string;
  category?: string;
  amount?: number;
  date?: string;
}

export interface Income {
  id: string;
  userId: string;
  name: string | null;
  category: string;
  amount: number;
  date: string;
  isRecurring: boolean;
  recurringGroupId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IncomesResponse {
  data: Income[];
}

export interface IncomeResponse {
  data: Income;
}

export interface CreateIncomeResponse {
  message: string;
  data: Income[];
}

export interface UpdateIncomeResponse {
  message: string;
  data: Income;
}

export interface Stats {
  balance: number; // em centavos
  balanceChange: number; // percentual
  income: number; // em centavos
  incomeChange: number; // percentual
  expense: number; // em centavos
  expenseChange: number; // percentual
}

export interface StatsResponse {
  data: Stats;
}

type Period = 'this-month' | 'last-month' | 'this-year' | 'last-12-months';

export const incomesService = {
  async create(data: CreateIncomeRequest): Promise<CreateIncomeResponse> {
    const response = await api.post<CreateIncomeResponse>('/incomes', data);
    return response.data;
  },

  async findAll(period?: Period): Promise<IncomesResponse> {
    const params = period ? { period } : {};
    const response = await api.get<IncomesResponse>('/incomes', { params });
    return response.data;
  },

  async getStats(
    period?: Period,
    startDate?: Date,
    endDate?: Date,
  ): Promise<StatsResponse> {
    const params: Record<string, string> = {};
    if (period) {
      params.period = period;
    }
    if (startDate && endDate) {
      params.startDate = startDate.toISOString().split('T')[0];
      params.endDate = endDate.toISOString().split('T')[0];
    }
    const response = await api.get<StatsResponse>('/incomes/stats', {
      params,
    });
    return response.data;
  },

  async findOne(id: string): Promise<IncomeResponse> {
    const response = await api.get<IncomeResponse>(`/incomes/${id}`);
    return response.data;
  },

  async update(
    id: string,
    data: UpdateIncomeRequest,
  ): Promise<UpdateIncomeResponse> {
    const response = await api.put<UpdateIncomeResponse>(
      `/incomes/${id}`,
      data,
    );
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/incomes/${id}`);
  },

  async findByCategory(category: string): Promise<IncomesResponse> {
    const response = await api.get<IncomesResponse>(
      `/incomes/category/${category}`,
    );
    return response.data;
  },

  async getLatestTransactions(limit: number = 10): Promise<{
    data: Array<{
      id: string;
      description: string;
      categoryIcon: string;
      category: string;
      date: string;
      purchaseDate?: string | null;
      amount: number;
      type: 'income' | 'expense';
      is_paid?: boolean;
    }>;
  }> {
    const response = await api.get('/incomes/latest-transactions', {
      params: { limit },
    });
    return response.data;
  },

  async getFirstTransactionDate(): Promise<{
    data: { date: string | null };
  }> {
    const response = await api.get('/incomes/first-transaction-date');
    return response.data;
  },

  async getTransactions(filters?: {
    startDate?: Date;
    endDate?: Date;
    category?: string;
    minAmount?: number;
    maxAmount?: number;
    description?: string;
    period?: Period;
    month?: number;
    year?: number;
    type?: 'income' | 'expense';
  }): Promise<{
    data: Array<{
      id: string;
      description: string;
      categoryIcon: string;
      category: string;
      date: string;
      purchaseDate?: string | null;
      amount: number;
      is_paid?: boolean;
      type: 'income' | 'expense';
    }>;
  }> {
    const params: Record<string, string> = {};
    if (filters?.startDate) {
      params.startDate = filters.startDate.toISOString().split('T')[0];
    }
    if (filters?.endDate) {
      params.endDate = filters.endDate.toISOString().split('T')[0];
    }
    if (filters?.category) {
      params.category = filters.category;
    }
    if (filters?.minAmount !== undefined) {
      params.minAmount = filters.minAmount.toString();
    }
    if (filters?.maxAmount !== undefined) {
      params.maxAmount = filters.maxAmount.toString();
    }
    if (filters?.description) {
      params.description = filters.description;
    }
    if (filters?.period) {
      params.period = filters.period;
    }
    if (filters?.month !== undefined) {
      params.month = filters.month.toString();
    }
    if (filters?.year !== undefined) {
      params.year = filters.year.toString();
    }
    if (filters?.type) {
      params.type = filters.type;
    }
    const response = await api.get('/incomes/transactions', { params });
    return response.data;
  },

};
