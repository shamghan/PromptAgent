import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SettingsModal from '../SettingsModal';

const defaultProps = {
  systemPrompt: 'Default system prompt content',
  onSave: vi.fn(),
  onClose: vi.fn(),
  isOpen: true,
};

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('SettingsModal', () => {
  it('returns null when isOpen is false', () => {
    const { container } = render(<SettingsModal {...defaultProps} isOpen={false} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders the modal when open', () => {
    render(<SettingsModal {...defaultProps} />);
    expect(screen.getByText('Settings')).toBeTruthy();
    expect(screen.getByText('Customise the AI system prompt')).toBeTruthy();
  });

  it('shows save button', () => {
    render(<SettingsModal {...defaultProps} />);
    expect(screen.getByText('Save')).toBeTruthy();
  });

  it('shows reset button', () => {
    render(<SettingsModal {...defaultProps} />);
    expect(screen.getByText('Reset to default')).toBeTruthy();
  });

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn();
    render(<SettingsModal {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onSave when Save is clicked', () => {
    const onSave = vi.fn();
    const onClose = vi.fn();
    render(<SettingsModal {...defaultProps} onSave={onSave} onClose={onClose} />);
    fireEvent.click(screen.getByText('Save'));
    expect(onSave).toHaveBeenCalledWith('Default system prompt content');
    expect(onClose).toHaveBeenCalled();
  });

  it('displays the system prompt in the textarea', () => {
    render(<SettingsModal {...defaultProps} systemPrompt="Custom prompt text" />);
    const textarea = screen.getByDisplayValue('Custom prompt text');
    expect(textarea).toBeTruthy();
  });

  it('updates local draft on textarea change', () => {
    render(<SettingsModal {...defaultProps} />);
    const textarea = screen.getByDisplayValue('Default system prompt content');
    fireEvent.change(textarea, { target: { value: 'New draft text' } });
    expect(textarea.value).toBe('New draft text');
  });

  it('renders model selector', () => {
    render(<SettingsModal {...defaultProps} />);
    expect(screen.getByText('AI Model')).toBeTruthy();
  });
});
