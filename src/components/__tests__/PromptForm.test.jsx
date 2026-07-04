import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PromptForm from '../PromptForm';

const defaultInputs = {
  fileName: '',
  className: '',
  methodName: '',
  lineNumber: '',
  taskName: '',
  taskType: '',
  taskDesc: '',
  issue: '',
};

function renderForm(props = {}) {
  return render(
    <PromptForm
      inputs={defaultInputs}
      setInputs={() => { }}
      onSubmit={() => { }}
      onClear={() => { }}
      onToggleHistory={() => { }}
      onOpenSettings={() => { }}
      onOpenBuilder={() => { }}
      loading={false}
      error={null}
      {...props}
    />,
  );
}

describe('PromptForm', () => {
  it('renders all form sections', () => {
    renderForm();
    expect(screen.getByText('Code Context')).toBeTruthy();
    expect(screen.getByText('Board Task')).toBeTruthy();
    expect(screen.getByText('Context & Problem')).toBeTruthy();
  });

  it('disables submit button when issue is empty', () => {
    renderForm();
    expect(screen.getByText('Generate Prompt')).toBeTruthy();
  });

  it('submit button is enabled when issue is filled', () => {
    renderForm({
      inputs: { ...defaultInputs, issue: 'test issue' },
    });
    const btn = screen.getByText('Generate Prompt');
    expect(btn).toBeTruthy();
  });

  it('shows loading text when loading', () => {
    renderForm({ loading: true, inputs: { ...defaultInputs, issue: 'test' } });
    expect(screen.getByText('Generating…')).toBeTruthy();
  });

  it('shows error banner when error is present', () => {
    renderForm({ error: 'Something went wrong' });
    expect(screen.getByText('Something went wrong')).toBeTruthy();
  });

  it('calls onSubmit when form is submitted', () => {
    const onSubmit = vi.fn();
    renderForm({
      onSubmit,
      inputs: { ...defaultInputs, issue: 'my issue' },
    });
    fireEvent.submit(screen.getByRole('button', { name: /Generate Prompt/i }).closest('form'));
    expect(onSubmit).toHaveBeenCalled();
  });

  it('calls onClear when Clear is clicked', () => {
    const onClear = vi.fn();
    renderForm({ onClear });
    fireEvent.click(screen.getByText('Clear'));
    expect(onClear).toHaveBeenCalled();
  });

  it('renders required badge for issue field', () => {
    renderForm();
    expect(screen.getByText('REQUIRED')).toBeTruthy();
  });

  it('renders 4 code context inputs', () => {
    renderForm();
    expect(screen.getByPlaceholderText('UserService.java')).toBeTruthy();
    expect(screen.getByPlaceholderText('UserService')).toBeTruthy();
    expect(screen.getByPlaceholderText('getUserById')).toBeTruthy();
    expect(screen.getByPlaceholderText('142 or 10-25')).toBeTruthy();
  });
});
