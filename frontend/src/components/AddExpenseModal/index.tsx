import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { Dialog, DialogOverlay, DialogPortal } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
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
import { X, CreditCard } from 'lucide-react';
import { expensesService } from '../../services/expenses.service';
import type {
  CreateExpenseRequest,
  UpdateExpenseRequest,
} from '../../services/expenses.service';
import { categoriesService } from '../../services/categories.service';
import type { Category, CategoryType } from '../../services/categories.service';
import { cardsService } from '../../services/cards.service';
import type { Card } from '../../services/cards.service';
import { IconRenderer } from '../../utils/iconMapper';
import {
  ModalForm,
  FormGroup,
  CategorySelectItemContent,
  FormRow,
  ErrorMessage,
  SubmitButton,
  StyledInput,
  StyledDialogContent,
  StyledDialogHeader,
  StyledDialogTitle,
  StyledDialogDescription,
  StyledLabel,
  StyledDialogClose,
} from '../AddIncomeModal/styles';
import styled from 'styled-components';

const InstallmentValueText = styled.div`
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: ${(props) => props.theme.textSecondary};
  font-weight: 500;
`;

const expenseSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  amount: z
    .string()
    .min(1, 'Valor é obrigatório')
    .refine(
      (val) => {
        const cleaned = val.replace(/[R$\s.]/g, '').replace(',', '.');
        const numValue = parseFloat(cleaned);
        return !isNaN(numValue) && numValue > 0 && numValue >= 0.01;
      },
      { message: 'Valor deve ser maior que zero e no mínimo R$ 0,01' },
    ),
  date: z.date(),
  is_paid: z.boolean(),
  paidWithCard: z.boolean(),
  cardId: z.string().optional(),
  installments: z.number().optional(),
}).refine(
  (data) => {
    if (data.paidWithCard && !data.cardId) {
      return false;
    }
    return true;
  },
  {
    message: 'Selecione um cartão quando pagar com cartão',
    path: ['cardId'],
  },
).transform((data) => {
  // Se pagar com cartão e não informar parcelas, assume 1 (à vista)
  if (data.paidWithCard && data.cardId && !data.installments) {
    return { ...data, installments: 1 };
  }
  return data;
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface AddExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  expenseId?: string | null;
}

export function AddExpenseModal({
  open,
  onOpenChange,
  onSuccess,
  expenseId,
}: AddExpenseModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [showUpdateGroupDialog, setShowUpdateGroupDialog] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<ExpenseFormData | null>(null);
  const [expenseGroupId, setExpenseGroupId] = useState<string | null>(null);
  const isEditing = !!expenseId;

  useEffect(() => {
    if (open) {
      setIsLoadingCategories(true);
      void Promise.all([
        categoriesService
          .findAll('expense' as CategoryType)
          .then((response) => setCategories(response.data))
          .catch(() => setCategories([])),
        cardsService
          .findAll()
          .then((response) => {
            setCards(response.data);
            // Se não estiver editando, buscar cartão padrão
            if (!expenseId) {
              const defaultCard = response.data.find((card) => card.isDefault);
              if (defaultCard) {
                // Não definir automaticamente, apenas quando marcar "Pago no cartão"
              }
            }
          })
          .catch(() => setCards([])),
      ]).finally(() => setIsLoadingCategories(false));
    }
  }, [open]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      name: '',
      category: '',
      amount: '',
      date: new Date(),
      is_paid: false,
      paidWithCard: false,
      cardId: undefined,
      installments: undefined,
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (!open) return;
  
    // editar
    if (expenseId && !isLoadingCategories && categories.length > 0) {
      void expensesService
        .findOne(expenseId)
        .then((response) => {
          const expense = response.data;
          // Data * no modal = data de compra (purchaseDate); fallback para date se não houver purchaseDate
          const dateSource = expense.purchaseDate ?? expense.date;
          const dateStr = dateSource.split('T')[0];
          const [year, month, day] = dateStr.split('-').map(Number);
          const expenseDate = new Date(year, month - 1, day);

          setExpenseGroupId(expense.groupId || null);
          reset({
            name: expense.name || '',
            category: expense.category,
            amount: new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(expense.amount / 100),
            date: expenseDate,
            is_paid: expense.is_paid ?? false,
            paidWithCard: !!expense.cardId,
            cardId: expense.cardId || undefined,
            installments: expense.installments || undefined,
          });
        });
    }
  
    // criar
    if (!expenseId && !isLoadingCategories) {
      reset({
        name: '',
        category: '',
        amount: '',
        date: new Date(),
        is_paid: false,
        paidWithCard: false,
        cardId: undefined,
        installments: undefined,
      });
    }
  }, [open, expenseId, isLoadingCategories, categories.length, reset]);
  

  const performUpdate = async (data: ExpenseFormData, updateGroup: boolean) => {
    setIsLoading(true);
    setError(null);

    try {
      // Converter valor formatado (R$ 3.000,00) para centavos
      const cleanedAmount = data.amount
        .replace(/[R$\s]/g, '')
        .replace(/\./g, '')
        .replace(',', '.');
      const numericAmount = parseFloat(cleanedAmount);
      const amountInCents = Math.round(numericAmount * 100);

      if (isEditing && expenseId) {
        const requestData: UpdateExpenseRequest = {
          name: data.name || undefined,
          category: data.category,
          amount: amountInCents,
          date: `${data.date.getFullYear()}-${String(data.date.getMonth() + 1).padStart(2, '0')}-${String(data.date.getDate()).padStart(2, '0')}`,
          is_paid: data.is_paid ?? false,
          // Sempre enviar cardId explicitamente (null se não tiver, string se tiver)
          // Isso permite ao backend detectar quando o cartão foi adicionado ou removido
          cardId: data.paidWithCard && data.cardId ? data.cardId : null,
          installments: data.paidWithCard && data.cardId ? (data.installments || 1) : null,
        };
        await expensesService.update(expenseId, requestData, updateGroup);
      } else {
        const requestData: CreateExpenseRequest = {
          name: data.name || undefined,
          category: data.category,
          amount: amountInCents,
          date: `${data.date.getFullYear()}-${String(data.date.getMonth() + 1).padStart(2, '0')}-${String(data.date.getDate()).padStart(2, '0')}`,
          is_paid: data.is_paid ?? false,
          cardId: data.cardId || null,
          installments: data.paidWithCard && data.cardId ? (data.installments || 1) : null,
        };
        await expensesService.create(requestData);
      }
      reset();
      setExpenseGroupId(null);
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Erro ao criar despesa');
      } else {
        setError('Erro ao criar despesa. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ExpenseFormData) => {
    // Se está editando e a expense tem groupId, mostrar diálogo de confirmação
    if (isEditing && expenseId && expenseGroupId) {
      setPendingFormData(data);
      setShowUpdateGroupDialog(true);
      return;
    }

    // Caso contrário, fazer update normalmente
    await performUpdate(data, false);
  };

  const handleUpdateGroupConfirm = async (updateGroup: boolean) => {
    if (pendingFormData) {
      await performUpdate(pendingFormData, updateGroup);
    }
    setShowUpdateGroupDialog(false);
    setPendingFormData(null);
  };

  const handleUpdateGroupCancel = () => {
    setShowUpdateGroupDialog(false);
    setPendingFormData(null);
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <StyledDialogContent>
          <StyledDialogHeader>
            <StyledDialogTitle>
              {isEditing ? 'Editar Despesa' : 'Adicionar Despesa'}
            </StyledDialogTitle>
            <StyledDialogDescription>
              {isEditing
                ? 'Atualize os dados da despesa.'
                : 'Preencha os dados da despesa.'}
            </StyledDialogDescription>
          </StyledDialogHeader>
          <ModalForm onSubmit={handleSubmit(onSubmit)}>
            <FormGroup>
              <StyledLabel htmlFor="name">Nome da despesa</StyledLabel>
              <StyledInput
                id="name"
                type="text"
                placeholder="Nome da despesa"
                {...register('name')}
              />
              {errors.name && (
                <ErrorMessage>{errors.name.message}</ErrorMessage>
              )}
            </FormGroup>

            <FormGroup>
              <StyledLabel htmlFor="category">
                Categoria <span aria-label="obrigatório">*</span>
              </StyledLabel>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isLoading}
                  >
                    <SelectTrigger
                      id="category"
                      className="w-full py-5"
                      aria-invalid={!!errors.category}
                    >
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          <CategorySelectItemContent>
                            <IconRenderer
                              iconName={category.icon}
                              size={16}
                              fallback={null}
                            />
                            {category.name}
                          </CategorySelectItemContent>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && (
                <ErrorMessage>{errors.category.message}</ErrorMessage>
              )}
            </FormGroup>

            <FormRow>
              <FormGroup>
                <StyledLabel htmlFor="amount">
                  Valor <span aria-label="obrigatório">*</span>
                </StyledLabel>
                <Controller
                  name="amount"
                  control={control}
                  render={({ field }) => {
                    const handleChange = (
                      e: React.ChangeEvent<HTMLInputElement>,
                    ) => {
                      const input = e.target;
                      const value = e.target.value;

                      // Remove tudo exceto números
                      const numbers = value.replace(/\D/g, '');

                      if (!numbers) {
                        field.onChange('');
                        return;
                      }

                      // Trata o valor como centavos
                      const cents = parseInt(numbers, 10);
                      const reais = Math.floor(cents / 100);
                      const centavos = cents % 100;

                      // Formata com pontos de milhar
                      const formattedReais = reais
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                      const formattedCentavos = centavos
                        .toString()
                        .padStart(2, '0');

                      const formattedValue = `R$ ${formattedReais},${formattedCentavos}`;
                      field.onChange(formattedValue);

                      // Mantém o cursor no final
                      setTimeout(() => {
                        input.setSelectionRange(
                          formattedValue.length,
                          formattedValue.length,
                        );
                      }, 0);
                    };

                    return (
                      <StyledInput
                        id="amount"
                        type="text"
                        placeholder="R$ 0,00"
                        $error={!!errors.amount}
                        value={field.value || ''}
                        onChange={handleChange}
                        ref={field.ref}
                      />
                    );
                  }}
                />
                {errors.amount && (
                  <ErrorMessage>{errors.amount.message}</ErrorMessage>
                )}
              </FormGroup>

              <FormGroup>
                <StyledLabel htmlFor="date">
                  Data <span aria-label="obrigatório">*</span>
                </StyledLabel>
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="date"
                          variant="outline"
                          className="w-full justify-start text-left font-normal py-5"
                          aria-invalid={!!errors.date}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, 'dd/MM/yyyy', { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={isLoading}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.date && (
                  <ErrorMessage>{errors.date.message}</ErrorMessage>
                )}
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup className="flex-row items-center gap-2">
                <Controller
                  name="is_paid"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="is_paid"
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        // Se marcar "Pago", desmarcar "Pago no cartão" e limpar cartão
                        if (checked) {
                          setValue('paidWithCard', false);
                          setValue('cardId', undefined);
                          setValue('installments', undefined);
                        }
                      }}
                    />
                  )}
                />
                <StyledLabel htmlFor="is_paid">Pago</StyledLabel>
                {errors.is_paid && (
                  <ErrorMessage>{errors.is_paid.message}</ErrorMessage>
                )}
              </FormGroup>

              {cards.length > 0 && (
                <FormGroup className="flex-row items-center gap-2">
                  <Controller
                    name="paidWithCard"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="paidWithCard"
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          // Se marcar "Pago no cartão", desmarcar "Pago" e selecionar cartão padrão se necessário
                          if (checked) {
                            setValue('is_paid', false);
                            const currentCardId = watch('cardId');
                            if (!currentCardId) {
                              const defaultCard = cards.find((card) => card.isDefault);
                              if (defaultCard) {
                                setValue('cardId', defaultCard.id);
                              }
                            }
                            // Se não tiver parcelas definidas, assume 1 (à vista)
                            const currentInstallments = watch('installments');
                            if (!currentInstallments) {
                              setValue('installments', 1);
                            }
                          } else {
                            // Se desmarcou, limpar cartão e parcelas
                            setValue('cardId', undefined);
                            setValue('installments', undefined);
                          }
                        }}
                      />
                    )}
                  />
                  <StyledLabel htmlFor="paidWithCard">Pago no cartão</StyledLabel>
                  {errors.paidWithCard && (
                    <ErrorMessage>{errors.paidWithCard.message}</ErrorMessage>
                  )}
                </FormGroup>
              )}
            </FormRow>

            {watch('paidWithCard') && cards.length > 0 && (
              <FormRow>
                <FormGroup>
                  <StyledLabel htmlFor="cardId">
                    Cartão <span aria-label="obrigatório">*</span>
                  </StyledLabel>
                  <Controller
                    name="cardId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || 'none'}
                        onValueChange={(value) => {
                          const cardId = value === 'none' ? undefined : value;
                          field.onChange(cardId);
                          // Se selecionou um cartão e não tem parcelas definidas, assume 1 (à vista)
                          if (cardId && !watch('installments')) {
                            setValue('installments', 1);
                          }
                        }}
                        disabled={isLoading}
                      >
                        <SelectTrigger
                          id="cardId"
                          className="w-full py-5"
                          aria-invalid={!!errors.cardId}
                        >
                          <SelectValue placeholder="Selecione um cartão" />
                        </SelectTrigger>
                        <SelectContent>
                          {cards.map((card) => (
                            <SelectItem key={card.id} value={card.id}>
                              <CategorySelectItemContent>
                                <CreditCard size={16} />
                                {card.nickname}
                                {card.lastFourDigits && ` (**** ${card.lastFourDigits})`}
                                {card.isDefault && ' (Padrão)'}
                              </CategorySelectItemContent>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.cardId && (
                    <ErrorMessage>{errors.cardId.message}</ErrorMessage>
                  )}
                </FormGroup>

                <FormGroup>
                  <StyledLabel htmlFor="installments">
                    Parcelas
                  </StyledLabel>
                  <Controller
                    name="installments"
                    control={control}
                    render={({ field }) => {
                      // Se não tiver valor definido, assume 1 (à vista)
                      const installments = field.value || 1;
                      const amountValue = watch('amount');
                      let installmentValue = '';
                      
                      if (installments && installments > 0 && amountValue) {
                        // Converter valor formatado (R$ 3.000,00) para centavos
                        const cleanedAmount = amountValue
                          .replace(/[R$\s]/g, '')
                          .replace(/\./g, '')
                          .replace(',', '.');
                        const numericAmount = parseFloat(cleanedAmount);
                        
                        if (!isNaN(numericAmount) && numericAmount > 0) {
                          const valuePerInstallment = numericAmount / installments;
                          installmentValue = `${installments}x ${new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(valuePerInstallment)}`;
                        }
                      }

                      return (
                        <div>
                          <StyledInput
                            id="installments"
                            type="text"
                            inputMode="numeric"
                            placeholder="Ex: 3"
                            disabled={!watch('cardId') || isLoading}
                            value={field.value || ''}
                            onChange={(e) => {
                              // Aceitar apenas números
                              const numbers = e.target.value.replace(/\D/g, '');
                              if (numbers) {
                                const parsed = parseInt(numbers, 10);
                                if (parsed >= 1 && parsed <= 24) {
                                  field.onChange(parsed);
                                } else if (parsed > 24) {
                                  field.onChange(24);
                                }
                              } else {
                                // Quando limpar o campo, mantém undefined (será tratado como 1 no submit)
                                field.onChange(undefined);
                              }
                            }}
                            onBlur={field.onBlur}
                            ref={field.ref}
                          />
                          {installmentValue && (
                            <InstallmentValueText>
                              {installmentValue}
                            </InstallmentValueText>
                          )}
                        </div>
                      );
                    }}
                  />
                  {errors.installments && (
                    <ErrorMessage>{errors.installments.message}</ErrorMessage>
                  )}
                </FormGroup>
              </FormRow>
            )}

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <SubmitButton type="submit" disabled={isLoading}>
              {isLoading
                ? isEditing
                  ? 'Salvando...'
                  : 'Criando...'
                : isEditing
                  ? 'Salvar Alterações'
                  : 'Criar Despesa'}
            </SubmitButton>
          </ModalForm>
          <StyledDialogClose aria-label="Fechar">
            <X size={20} />
          </StyledDialogClose>
        </StyledDialogContent>
      </DialogPortal>
    </Dialog>

    <AlertDialog open={showUpdateGroupDialog} onOpenChange={setShowUpdateGroupDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Atualizar grupo de despesas</AlertDialogTitle>
          <AlertDialogDescription>
            Esta despesa faz parte de um grupo parcelado. Deseja aplicar as alterações para todas as parcelas do grupo?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleUpdateGroupCancel}>
            Cancelar
          </AlertDialogCancel>
          <Button
            variant="outline"
            onClick={() => handleUpdateGroupConfirm(false)}
          >
            Apenas esta parcela
          </Button>
          <AlertDialogAction onClick={() => handleUpdateGroupConfirm(true)}>
            Todo o grupo
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
