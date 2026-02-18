import styled from 'styled-components';

export const AnalyticsWrapper = styled.div<{ $theme: 'light' | 'dark' }>`
  min-height: 100vh;
  background-color: ${(props) =>
    props.$theme === 'light' ? '#f9fafb' : '#111827'};
  display: flex;
  flex-direction: column;
`;

export const AnalyticsMain = styled.main`
  flex: 1;
  padding: 2rem;
  max-width: 90rem;
  width: 100%;
  margin: 0 auto;
`;

export const AnalyticsContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${(props) => props.theme.text};
  margin: 0;
`;

export const FilterSection = styled.section`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const PeriodSelector = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

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
  transition: background-color 0.2s, color 0.2s;

  &:hover {
    background-color: ${(props) => props.theme.surfaceSecondary};
    color: ${(props) => props.theme.text};
  }

  &:focus-visible {
    outline: 0.125rem solid ${(props) => props.theme.primary};
    outline-offset: 0.125rem;
  }
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
  gap: 1rem;
  align-items: stretch;

  @media (max-width: 640px) {
    grid-template-columns: 1fr 1fr;
  }

  /* Garantir que todos os cards tenham a mesma altura */
  [data-slot='card'] {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  /* Garantir altura consistente do header */
  [data-slot='card-header'] {
    min-height: 2rem;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  /* Alinhar valores na mesma linha */
  [data-slot='card-content'] {
    display: flex;
    align-items: flex-end;
    min-height: 2.5rem;
    margin-top: auto;
  }
`;

export const ChartSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${(props) => props.theme.text};
  margin: 0;
`;

export const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const ChartCard = styled.div`
  background-color: ${(props) => props.theme.surface};
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 0.0625rem solid ${(props) => props.theme.border};
  min-height: 18rem;
`;

export const ChartCardFull = styled(ChartCard)`
  grid-column: 1 / -1;
`;

export const InsightsSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const InsightsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const InsightCard = styled.div<{ $severity: 'info' | 'warning' | 'success' | 'error' }>`
  background-color: ${(props) => props.theme.surface};
  border-radius: 0.5rem;
  padding: 1rem 1.25rem;
  border-left: 0.25rem solid
    ${(props) => {
      switch (props.$severity) {
        case 'error':
          return '#ef4444';
        case 'warning':
          return '#f59e0b';
        case 'success':
          return '#22c55e';
        default:
          return '#3b82f6';
      }
    }};
  border: 0.0625rem solid ${(props) => props.theme.border};
  border-left-width: 0.25rem;
  border-left-color: ${(props) => {
    switch (props.$severity) {
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'success':
        return '#22c55e';
      default:
        return '#3b82f6';
    }
  }};
`;

export const ChartContainer = styled.div`
  width: 100%;
  height: 18rem;
  min-height: 12rem;

  @media (max-width: 640px) {
    height: 16rem;
    min-height: 10rem;
  }

  /* Remover background cinza do hover nas barras do recharts */
  .recharts-active-bar {
    display: none !important;
  }

  .recharts-bar-rectangle:hover {
    opacity: 0.8;
  }

  /* Remover qualquer background de hover do tooltip cursor */
  .recharts-tooltip-cursor {
    fill: transparent !important;
    stroke: transparent !important;
  }

  /* Remover background de hover em gráficos de barras */
  .recharts-bar .recharts-bar-rectangle {
    cursor: pointer;
  }

  /* Remover overlay de hover */
  .recharts-active-shape {
    display: none !important;
  }

  /* Remover qualquer elemento de background de hover */
  .recharts-reference-line,
  .recharts-reference-area {
    display: none;
  }

  /* Para gráficos de barras verticais - remover background de hover */
  .recharts-cartesian-axis-tick-value {
    fill: ${(props) => props.theme.textSecondary};
  }
`;

export const CustomTooltipContainer = styled.div<{ $isDark: boolean }>`
  background-color: ${(props) => (props.$isDark ? '#1e1e1e' : '#ffffff')};
  border: 0.0625rem solid ${(props) => (props.$isDark ? '#2a2a2a' : '#e5e5e5')};
  border-radius: 0.5rem;
  padding: 0.75rem;
  color: ${(props) => (props.$isDark ? '#ffffff' : '#111827')};
  font-size: 0.875rem;
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);
`;

export const TooltipLabel = styled.div`
  color: ${(props) => props.theme.text};
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

export const TooltipValue = styled.div`
  color: ${(props) => props.theme.text};
  font-weight: 500;
`;
