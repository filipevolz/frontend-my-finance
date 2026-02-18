import styled from 'styled-components';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { DialogTitle } from '../ui/dialog';

export const StyledInput = styled(Input)<{ $error?: boolean }>`
  padding: 1.25rem 1rem;

  /* Remover spinners do input number */
  &[type='number'] {
    -moz-appearance: textfield;
  }

  &[type='number']::-webkit-inner-spin-button,
  &[type='number']::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  ${(props) =>
    props.$error &&
    `
    border-color: ${props.theme.error};
    &:focus-visible {
      border-color: ${props.theme.error};
      ring-color: ${props.theme.error};
    }
  `}
`;

export const ModalForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  color: ${(props) => props.theme.text};
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

`;

export const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  input[type='checkbox'] {
    width: 1.25rem;
    height: 1.25rem;
    cursor: pointer;
  }
`;

export const CheckboxLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 400;
  color: ${(props) => props.theme.text};
  cursor: pointer;
  user-select: none;
`;

export const ErrorMessage = styled.span`
  color: ${(props) => props.theme.error};
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

export const SubmitButton = styled(Button)`
  width: 100%;
  margin-top: 0.5rem;
`;

export const StyledDialogContent = styled(DialogPrimitive.Content)`
  padding: 2rem;
  max-width: 32rem;
  width: calc(100% - 2rem);
  background-color: ${(props) => props.theme.surface};
  border-radius: 0.75rem;
  border: 0.0625rem solid ${(props) => props.theme.border};
  box-shadow: 0 0.25rem 0.5rem ${(props) => props.theme.shadow};
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 50;
  outline: none;
  display: flex;
  flex-direction: column;
`;

export const StyledDialogHeader = styled.div``;

export const StyledDialogTitle = styled(DialogTitle)`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${(props) => props.theme.text};
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
`;

export const StyledDialogDescription = styled.p`
  font-size: 0.875rem;
  font-weight: 400;
  color: ${(props) => props.theme.textSecondary};
  margin: 0;
  line-height: 1.5;
`;

export const StyledLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${(props) => props.theme.text};
`;

export const StyledDialogClose = styled(DialogPrimitive.Close)`
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  background: transparent;
  border: none;
  color: ${(props) => props.theme.textSecondary};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${(props) => props.theme.surfaceSecondary};
    color: ${(props) => props.theme.text};
  }

  &:focus-visible {
    outline: 0.125rem solid ${(props) => props.theme.primary};
    outline-offset: 0.125rem;
  }
`;

export const CategorySelectItemContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;
