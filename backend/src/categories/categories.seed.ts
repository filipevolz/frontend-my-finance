import { Category, CategoryType } from './category.entity';

export const categoriesSeed: Partial<Category>[] = [
  // Income Categories
  { name: 'Salário', type: CategoryType.INCOME, icon: 'DollarSign' },
  { name: 'Freelance', type: CategoryType.INCOME, icon: 'Briefcase' },
  { name: 'Comissão', type: CategoryType.INCOME, icon: 'TrendingUp' },
  { name: 'Vendas', type: CategoryType.INCOME, icon: 'ShoppingCart' },
  { name: 'Cashback', type: CategoryType.INCOME, icon: 'CreditCard' },
  { name: 'Rendimentos', type: CategoryType.INCOME, icon: 'LineChart' },
  { name: 'Aluguel recebido', type: CategoryType.INCOME, icon: 'Home' },
  { name: 'Reembolso', type: CategoryType.INCOME, icon: 'RotateCcw' },
  { name: 'Presentes', type: CategoryType.INCOME, icon: 'Gift' },
  { name: 'Outros', type: CategoryType.INCOME, icon: 'Plus' },

  // Expense Categories - Moradia
  { name: 'Aluguel', type: CategoryType.EXPENSE, icon: 'Home' },
  { name: 'Condomínio', type: CategoryType.EXPENSE, icon: 'Building2' },
  { name: 'Água', type: CategoryType.EXPENSE, icon: 'Droplet' },
  { name: 'Luz', type: CategoryType.EXPENSE, icon: 'Lightbulb' },
  { name: 'Gás', type: CategoryType.EXPENSE, icon: 'Flame' },
  { name: 'Internet', type: CategoryType.EXPENSE, icon: 'Wifi' },
  { name: 'Manutenção', type: CategoryType.EXPENSE, icon: 'Wrench' },

  // Expense Categories - Alimentação
  { name: 'Mercado', type: CategoryType.EXPENSE, icon: 'ShoppingCart' },
  { name: 'Restaurante', type: CategoryType.EXPENSE, icon: 'UtensilsCrossed' },
  { name: 'Delivery', type: CategoryType.EXPENSE, icon: 'Package' },
  { name: 'Lanches', type: CategoryType.EXPENSE, icon: 'Sandwich' },
  { name: 'Café', type: CategoryType.EXPENSE, icon: 'Coffee' },

  // Expense Categories - Transporte
  { name: 'Combustível', type: CategoryType.EXPENSE, icon: 'Fuel' },
  { name: 'Uber / 99', type: CategoryType.EXPENSE, icon: 'Car' },
  { name: 'Transporte público', type: CategoryType.EXPENSE, icon: 'Bus' },
  { name: 'Estacionamento', type: CategoryType.EXPENSE, icon: 'ParkingCircle' },
  { name: 'Manutenção do carro', type: CategoryType.EXPENSE, icon: 'Wrench' },
  { name: 'Seguro', type: CategoryType.EXPENSE, icon: 'Shield' },

  // Expense Categories - Financeiro
  { name: 'Cartão de crédito', type: CategoryType.EXPENSE, icon: 'CreditCard' },
  { name: 'Fatura cartão', type: CategoryType.EXPENSE, icon: 'FileText' },
  { name: 'Juros', type: CategoryType.EXPENSE, icon: 'Percent' },
  { name: 'Tarifas bancárias', type: CategoryType.EXPENSE, icon: 'Building' },
  { name: 'Empréstimos', type: CategoryType.EXPENSE, icon: 'Banknote' },
  { name: 'Investimentos', type: CategoryType.EXPENSE, icon: 'TrendingUp' },

  // Expense Categories - Saúde
  { name: 'Plano de saúde', type: CategoryType.EXPENSE, icon: 'Heart' },
  { name: 'Remédios', type: CategoryType.EXPENSE, icon: 'Pill' },
  { name: 'Consultas', type: CategoryType.EXPENSE, icon: 'Stethoscope' },
  { name: 'Exames', type: CategoryType.EXPENSE, icon: 'Microscope' },
  { name: 'Terapia', type: CategoryType.EXPENSE, icon: 'Brain' },

  // Expense Categories - Lazer
  { name: 'Streaming', type: CategoryType.EXPENSE, icon: 'Tv' },
  { name: 'Cinema', type: CategoryType.EXPENSE, icon: 'Film' },
  { name: 'Jogos', type: CategoryType.EXPENSE, icon: 'Gamepad2' },
  { name: 'Viagens', type: CategoryType.EXPENSE, icon: 'Plane' },
  { name: 'Bares', type: CategoryType.EXPENSE, icon: 'Wine' },
  { name: 'Hobbies', type: CategoryType.EXPENSE, icon: 'Palette' },

  // Expense Categories - Compras
  { name: 'Roupas', type: CategoryType.EXPENSE, icon: 'Shirt' },
  { name: 'Calçados', type: CategoryType.EXPENSE, icon: 'Footprints' },
  { name: 'Eletrônicos', type: CategoryType.EXPENSE, icon: 'Smartphone' },
  { name: 'Casa', type: CategoryType.EXPENSE, icon: 'Home' },
  { name: 'Presentes', type: CategoryType.EXPENSE, icon: 'Gift' },

  // Expense Categories - Educação
  { name: 'Cursos', type: CategoryType.EXPENSE, icon: 'BookOpen' },
  { name: 'Faculdade', type: CategoryType.EXPENSE, icon: 'GraduationCap' },
  { name: 'Livros', type: CategoryType.EXPENSE, icon: 'Book' },
  { name: 'Assinaturas educacionais', type: CategoryType.EXPENSE, icon: 'FileText' },

  // Expense Categories - Família / Pets
  { name: 'Escola', type: CategoryType.EXPENSE, icon: 'School' },
  { name: 'Creche', type: CategoryType.EXPENSE, icon: 'Baby' },
  { name: 'Pets', type: CategoryType.EXPENSE, icon: 'Dog' },
  { name: 'Veterinário', type: CategoryType.EXPENSE, icon: 'Heart' },
  { name: 'Ração', type: CategoryType.EXPENSE, icon: 'Bone' },

  // Expense Categories - Obrigações
  { name: 'Impostos', type: CategoryType.EXPENSE, icon: 'Receipt' },
  { name: 'Multas', type: CategoryType.EXPENSE, icon: 'AlertTriangle' },
  { name: 'Documentos', type: CategoryType.EXPENSE, icon: 'FileText' },
  { name: 'Contador', type: CategoryType.EXPENSE, icon: 'User' },

  // Expense Categories - Outros
  { name: 'Serviços', type: CategoryType.EXPENSE, icon: 'Settings' },
  { name: 'Assinaturas', type: CategoryType.EXPENSE, icon: 'Receipt' },
  { name: 'Doações', type: CategoryType.EXPENSE, icon: 'Heart' },
  { name: 'Outros', type: CategoryType.EXPENSE, icon: 'Plus' },
];
