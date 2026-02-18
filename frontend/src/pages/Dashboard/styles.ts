import styled from 'styled-components';
import { Avatar } from '@/components/ui/avatar';

export const DashboardWrapper = styled.div`
  min-height: 100vh;
  background-color: ${(props) => props.theme.background};
  display: flex;
  flex-direction: column;
  transition: background-color 0.3s ease;
`;

export const DashboardHeader = styled.header`
  background-color: ${(props) => props.theme.surface};
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 0.0625rem solid ${(props) => props.theme.border};
  box-shadow: 0 0.0625rem 0.1875rem ${(props) => props.theme.shadow};
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;
`;

export const NavMenu = styled.nav`
  display: flex;
  gap: 2rem;
  align-items: center;
  flex: 1;
  justify-content: center;
`;

export const NavItem = styled.button<{ $active?: boolean }>`
  background: none;
  border: none;
  color: ${(props) =>
    props.$active ? props.theme.primary : props.theme.textSecondary};
  font-size: 1rem;
  font-weight: ${(props) => (props.$active ? 600 : 400)};
  cursor: pointer;
  padding: 0.5rem 0;
  position: relative;
  transition: color 0.2s;

  &:hover {
    color: ${(props) => props.theme.primary};
  }

  &:focus-visible {
    outline: 0.125rem solid ${(props) => props.theme.primary};
    outline-offset: 0.25rem;
    border-radius: 0.25rem;
  }

  ${(props) =>
    props.$active &&
    `
    &::after {
      content: '';
      position: absolute;
      bottom: -1.5rem;
      left: 0;
      right: 0;
      height: 0.1875rem;
      background-color: ${props.theme.primary};
    }
  `}
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const IconButton = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.theme.textSecondary};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
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

export const StyledAvatar = styled(Avatar)`
  border-radius: 50%;
  overflow: hidden;

  [data-slot='avatar-fallback'] {
    background-color: ${(props) => props.theme.primary};
    color: ${(props) => props.theme.text};
    font-weight: 600;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

export const DashboardMain = styled.main`
  flex: 1;
  padding: 2rem;
  max-width: 90rem;
  width: 100%;
  margin: 0 auto;
`;

export const DashboardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export const WelcomeSection = styled.section`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

export const WelcomeTitle = styled.h1`
  color: ${(props) => props.theme.text};
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  transition: color 0.3s ease;
`;

export const PeriodSelector = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

export const PeriodButton = styled.button<{ $active?: boolean }>`
  background-color: ${(props) =>
    props.$active ? props.theme.primary : props.theme.surface};
  color: ${(props) => (props.$active ? '#fff' : props.theme.textSecondary)};
  border: 0.0625rem solid
    ${(props) => (props.$active ? props.theme.primary : props.theme.border)};
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${(props) =>
    props.$active ? props.theme.primaryHover : props.theme.surfaceSecondary};
    border-color: ${(props) =>
    props.$active ? props.theme.primaryHover : props.theme.borderHover};
  }

  &:focus-visible {
    outline: 0.125rem solid ${(props) => props.theme.primary};
    outline-offset: 0.125rem;
  }
`;

export const PeriodSelectButton = styled.button<{ $active?: boolean }>`
  background-color: ${(props) =>
    props.$active ? props.theme.primary : props.theme.surface};
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
      : props.theme.surfaceSecondary};
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

export const PeriodSelectWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const DatePickerTriggerButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
`;

export const ClearDateRangeButton = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.theme.textSecondary};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
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

export const ViewMoreButtonContainer = styled.div<{ $theme: 'light' | 'dark' }>`
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 0.0625rem solid
    ${(props) => (props.$theme === 'light' ? '#e5e7eb' : '#374151')};
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

export const StatCard = styled.article`
  background-color: ${(props) => props.theme.surface};
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 0.0625rem solid ${(props) => props.theme.border};
  box-shadow: 0 0.0625rem 0.1875rem ${(props) => props.theme.shadow};
  transition: all 0.3s ease;

  &:hover {
    border-color: ${(props) => props.theme.borderHover};
  }
`;

export const StatCardHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

export const StatCardTitle = styled.h2`
  color: ${(props) => props.theme.textSecondary};
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const StatCardChange = styled.span<{ $positive?: boolean }>`
  color: ${(props) =>
    props.$positive ? props.theme.success : props.theme.error};
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

export const StatCardValue = styled.strong<{ $positive?: boolean }>`
  color: ${(props) =>
    props.$positive ? props.theme.primary : props.theme.error};
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
  display: block;
`;

export const ActionCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

export const ActionCard = styled.button`
  background-color: ${(props) => props.theme.surface};
  border: 0.0625rem solid ${(props) => props.theme.border};
  border-radius: 0.75rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  box-shadow: 0 0.0625rem 0.1875rem ${(props) => props.theme.shadow};

  &:hover {
    border-color: ${(props) => props.theme.borderHover};
    box-shadow: 0 0.25rem 0.5rem ${(props) => props.theme.shadowHover};
  }

  &:focus-visible {
    outline: 0.125rem solid ${(props) => props.theme.primary};
    outline-offset: 0.125rem;
  }
`;

export const ActionCardIcon = styled.div<{ $color: string }>`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background-color: ${(props) => props.$color}15;
  color: ${(props) => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const ActionCardTitle = styled.h3`
  color: ${(props) => props.theme.text};
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  transition: color 0.3s ease;
`;

export const ActionCardDescription = styled.p`
  color: ${(props) => props.theme.textSecondary};
  font-size: 0.875rem;
  margin: 0;
`;

export const BottomSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const ExpensesByCategoryCard = styled.article`
  background-color: ${(props) => props.theme.surface};
  border-radius: 0.75rem;
  padding: 2rem;
  border: 0.0625rem solid ${(props) => props.theme.border};
  box-shadow: 0 0.0625rem 0.1875rem ${(props) => props.theme.shadow};
  transition: all 0.3s ease;

  h2 {
    color: ${(props) => props.theme.text};
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 1.5rem 0;
    transition: color 0.3s ease;
  }

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

export const CategoryChartContainer = styled.div`
  width: 100%;
  height: 12rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const CategoryLegend = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const CategoryItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const CategoryIcon = styled.div<{ $color?: string }>`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background-color: ${(props) =>
    props.$color ? props.$color : props.theme.surfaceSecondary};
  color: ${(props) => props.theme.text};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
  line-height: 1;
`;

export const CategoryInfo = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  align-items: center;

  span {
    color: ${(props) => props.theme.text};
    font-size: 0.875rem;
    font-weight: 500;
    transition: color 0.3s ease;
  }
`;

export const CategoryPercentage = styled.span`
  color: ${(props) => props.theme.textSecondary};
  font-size: 0.875rem;
  font-weight: 600;
`;

export const TransactionsCard = styled.article`
  background-color: ${(props) => props.theme.surface};
  border-radius: 0.75rem;
  padding: 2rem;
  border: 0.0625rem solid ${(props) => props.theme.border};
  box-shadow: 0 0.0625rem 0.1875rem ${(props) => props.theme.shadow};
  transition: all 0.3s ease;

  > div:first-child {
    margin-bottom: 1.5rem;

    h2 {
      color: ${(props) => props.theme.text};
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 0.25rem 0;
      transition: color 0.3s ease;
    }

    p {
      color: ${(props) => props.theme.textSecondary};
      font-size: 0.875rem;
      margin: 0;
    }
  }

  @media (max-width: 768px) {
    display: none;
    padding: 1rem;
  }
`;

export const TransactionsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

export const TableHeader = styled.thead`
  th {
    color: ${(props) => props.theme.textSecondary};
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    text-align: left;
    padding: 0.75rem 0;
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
  padding: 1rem 0;
  vertical-align: middle;
`;

export const TransactionCellContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const TransactionAvatar = styled.div`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: ${(props) => props.theme.primary};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  flex-shrink: 0;
`;

export const TransactionDescription = styled.p`
  color: ${(props) => props.theme.text};
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: color 0.3s ease;
  margin: 0;

  strong {
    color: ${(props) => props.theme.text};
    font-size: 0.875rem;
    font-weight: 600;
    transition: color 0.3s ease;
  }
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

export const TransactionPaid = styled.span<{ $is_paid?: boolean, $type: 'income' | 'expense' }>`
  color: ${(props) => props.$type === 'expense' ? props.$is_paid ? props.theme.success : props.theme.error : props.theme.textSecondary};
  font-size: 0.875rem;
  font-weight: 600;

  span {
    color: ${(props) => props.theme.textSecondary};
    font-weight: 500;
  }
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

export const TransactionsCardMobile = styled(TransactionsCard)`
display: none;
flex-direction: column;

  @media (max-width: 768px) {
    display: flex;
  }
`

export const TransactionsList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  list-style: none;
`;

export const TransactionItem = styled.li`
  display: flex;
  gap: 0.75rem;
  border-top: 0.0625rem solid ${(props) => props.theme.border};
  padding-top: 0.5rem;
`;
