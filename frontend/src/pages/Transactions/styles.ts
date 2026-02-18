import styled from 'styled-components';
import { Search } from 'lucide-react';

export const TransactionsWrapper = styled.div`
  min-height: 100vh;
  background-color: ${(props) => props.theme.background};
  display: flex;
  flex-direction: column;
  transition: background-color 0.3s ease;
`;

export const BackButton = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.theme.textSecondary};
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition:
    background-color 0.2s,
    color 0.2s;

  &:hover {
    background-color: ${(props) => props.theme.surfaceSecondary};
    color: ${(props) => props.theme.text};
  }

  &:focus-visible {
    outline: 0.125rem solid ${(props) => props.theme.primary};
    outline-offset: 0.125rem;
  }
`;

export const TransactionsMain = styled.main`
  flex: 1;
  padding: 2rem;
  max-width: 90rem;
  width: 100%;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

export const TransactionsContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export const PageTitle = styled.h1`
  color: ${(props) => props.theme.text};
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  transition: color 0.3s ease;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

export const SearchAndFiltersContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 0.75rem;
  }
`;

export const SearchInputWrapper = styled.div`
  position: relative;
  flex: 1;
`;

export const SearchIcon = styled(Search)<{ $isLight?: boolean }>`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${(props) => (props.$isLight ? '#9ca3af' : '#6b7280')};
  pointer-events: none;
`;

export const FilterBadge = styled.span<{ $isLight?: boolean }>`
  margin-left: 0.5rem;
  background-color: ${(props) => (props.$isLight ? '#ef4444' : '#dc2626')};
  color: #fff;
  border-radius: 50%;
  width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
`;

export const FiltersSection = styled.section`
  background-color: ${(props) => props.theme.surface};
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 0.0625rem solid ${(props) => props.theme.border};
  box-shadow: 0 0.0625rem 0.1875rem ${(props) => props.theme.shadow};
  transition: all 0.3s ease;
`;

export const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

export const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const FilterLabel = styled.label`
  color: ${(props) => props.theme.textSecondary};
  font-size: 0.875rem;
  font-weight: 500;
  display: block;
`;

export const FilterInput = styled.input`
  background-color: ${(props) => props.theme.surfaceSecondary};
  border: 0.0625rem solid ${(props) => props.theme.border};
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  color: ${(props) => props.theme.text};
  font-size: 0.875rem;
  transition: all 0.2s;
  width: 100%;

  &:focus {
    outline: 0.125rem solid ${(props) => props.theme.primary};
    outline-offset: 0.125rem;
    border-color: ${(props) => props.theme.primary};
  }

  &::placeholder {
    color: ${(props) => props.theme.textSecondary};
  }

  &[readonly] {
    cursor: pointer;
  }
`;

export const CurrencyInputWrapper = styled.div`
  position: relative;
`;

export const CurrencyPrefix = styled.span<{ $isLight?: boolean }>`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${(props) => (props.$isLight ? '#6b7280' : '#9ca3af')};
  pointer-events: none;
  font-size: 0.875rem;
  font-weight: 500;
`;

export const CurrencyInput = styled(FilterInput)`
  padding-left: 2.5rem;
`;

export const SearchInput = styled(FilterInput)`
  padding-left: 2.5rem;
  width: 100%;
`;

export const FilterButton = styled.button<{ $active?: boolean }>`
  background-color: ${(props) =>
    props.$active ? props.theme.primary : props.theme.surfaceSecondary};
  color: ${(props) =>
    props.$active ? '#fff' : props.theme.textSecondary};
  border: 0.0625rem solid
    ${(props) =>
      props.$active ? props.theme.primary : props.theme.border};
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background-color: ${(props) =>
      props.$active
        ? props.theme.primaryHover
        : props.theme.surface};
    border-color: ${(props) =>
      props.$active
        ? props.theme.primaryHover
        : props.theme.borderHover};
  }

  &:focus-visible {
    outline: 0.125rem solid ${(props) => props.theme.primary};
    outline-offset: 0.125rem;
  }
`;

export const ClearFiltersButton = styled.button`
  background: none;
  border: 0.0625rem solid ${(props) => props.theme.border};
  color: ${(props) => props.theme.textSecondary};
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background-color: ${(props) => props.theme.surfaceSecondary};
    border-color: ${(props) => props.theme.borderHover};
    color: ${(props) => props.theme.text};
  }

  &:focus-visible {
    outline: 0.125rem solid ${(props) => props.theme.primary};
    outline-offset: 0.125rem;
  }
`;

export const ApplyFiltersButton = styled.button`
  background-color: ${(props) => props.theme.primary};
  color: #fff;
  border: 0.0625rem solid ${(props) => props.theme.primary};
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background-color: ${(props) => props.theme.primaryHover};
    border-color: ${(props) => props.theme.primaryHover};
  }

  &:focus-visible {
    outline: 0.125rem solid ${(props) => props.theme.primary};
    outline-offset: 0.125rem;
  }
`;

export const FiltersActionsContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 0.0625rem solid ${(props) => props.theme.border};

  @media (max-width: 768px) {
    flex-direction: column-reverse;
    gap: 0.5rem;
  }
`;

export const TransactionsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: ${(props) => props.theme.surface};
  border-radius: 0.75rem;
  overflow: hidden;
  border: 0.0625rem solid ${(props) => props.theme.border};
  box-shadow: 0 0.0625rem 0.1875rem ${(props) => props.theme.shadow};

  @media (max-width: 768px) {
    display: none;
  }
`;

export const TableHeader = styled.thead`
  background-color: ${(props) => props.theme.surfaceSecondary};
  th {
    color: ${(props) => props.theme.textSecondary};
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    text-align: left;
    padding: 0.75rem 1rem;
    border-bottom: 0.0625rem solid ${(props) => props.theme.border};
  }
`;

export const TableRow = styled.tr`
  border-bottom: 0.0625rem solid ${(props) => props.theme.surfaceSecondary};
  transition: background-color 0.2s;

  &:hover {
    background-color: ${(props) => props.theme.surfaceSecondary};
  }

  &:last-child {
    border-bottom: none;
  }
`;

export const TransactionCell = styled.td`
  padding: 1rem;
  vertical-align: middle;
`;

export const TransactionCellContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const TransactionDescription = styled.p`
  color: ${(props) => props.theme.text};
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.3s ease;
  margin: 0;
`;

export const TransactionMethod = styled.span`
  color: ${(props) => props.theme.textSecondary};
  font-size: 0.875rem;
`;

export const TransactionDate = styled.span`
  color: ${(props) => props.theme.textSecondary};
  font-size: 0.875rem;
`;

export const TransactionAmount = styled.span<{ $type: 'income' | 'expense' }>`
  color: ${(props) =>
    props.$type === 'income' ? props.theme.success : props.theme.error};
  font-size: 0.875rem;
  font-weight: 600;
`;

export const TransactionPaid = styled.span<{ $is_paid?: boolean, $type: 'income' | 'expense'}>`
  color: ${(props) => props.$type === 'expense' ? props.$is_paid ? props.theme.success : props.theme.error : props.theme.textSecondary };
  font-size: 0.875rem;
  font-weight: 600;
  padding-left: ${(props) => props.$type === 'expense' ? '0' : '0.5rem'};
`;

export const TransactionActions = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.theme.textSecondary};
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 0.2s,
    color 0.2s;

  &:hover {
    background-color: ${(props) => props.theme.surfaceSecondary};
    color: ${(props) => props.theme.text};
  }

  &:focus-visible {
    outline: 0.125rem solid ${(props) => props.theme.primary};
    outline-offset: 0.125rem;
  }
`;

export const TableEmptyCell = styled.td`
  text-align: center;
  padding: 2rem;
  color: ${(props) => props.theme.textSecondary};
  font-size: 0.875rem;
`;

export const EmptyStateText = styled.p`
  color: ${(props) => props.theme.textSecondary};
  font-size: 0.875rem;
  margin: 0;
`;

export const CategoryIcon = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background-color: ${(props) => props.theme.surfaceSecondary};
  color: ${(props) => props.theme.text};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
  line-height: 1;
`;

export const DatePickerButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  width: 100%;
`;

export const TransactionsTableMobile = styled.div`
  display: none;
  flex-direction: column;
  background-color: ${(props) => props.theme.surface};
  border-radius: 0.75rem;
  overflow: hidden;
  border: 0.0625rem solid ${(props) => props.theme.border};
  box-shadow: 0 0.0625rem 0.1875rem ${(props) => props.theme.shadow};
  padding: 1rem;

  @media (max-width: 768px) {
    display: flex;
  }
`;

export const TransactionsList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
`;

export const TransactionItem = styled.li`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  border-top: 0.0625rem solid ${(props) => props.theme.border};
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;

  &:first-child {
    border-top: none;
    padding-top: 0;
  }
`;

export const TransactionItemContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
`;

export const TransactionItemHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const TransactionItemMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const TransactionItemRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  flex-shrink: 0;
`;

export const TransactionMobileDate = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: ${(props) => props.theme.textSecondary};
`;

export const TransactionMobileDateLabel = styled.span`
  font-size: 0.625rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${(props) => props.theme.textSecondary};
  opacity: 0.7;
`;
