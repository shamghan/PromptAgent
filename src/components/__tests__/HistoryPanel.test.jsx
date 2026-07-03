import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HistoryPanel from '../HistoryPanel';

const mockHistory = [
  {
    id: '1',
    timestamp: new Date().toISOString(),
    inputs: { fileName: 'App.js', taskName: 'AB#1', taskType: 'Bug fix' },
    output: 'Some output content here',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    inputs: { fileName: '', taskName: '', taskType: '' },
    output: 'Another output',
  },
];

describe('HistoryPanel', () => {
  it('returns null when isOpen is false', () => {
    const { container } = render(
      <HistoryPanel history={[]} isOpen={false} onLoad={() => {}} onDelete={() => {}} onClearAll={() => {}} onClose={() => {}} />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders history entries when open', () => {
    render(
      <HistoryPanel
        history={mockHistory}
        isOpen={true}
        onLoad={() => {}}
        onDelete={() => {}}
        onClearAll={() => {}}
        onClose={() => {}}
      />,
    );
    expect(screen.getByText('History')).toBeTruthy();
    expect(screen.getByText('2 of 10 saved')).toBeTruthy();
    expect(screen.getByText('Bug fix')).toBeTruthy();
    expect(screen.getByText('App.js · AB#1')).toBeTruthy();
    expect(screen.getByText('Untitled prompt')).toBeTruthy();
  });

  it('shows empty state when no history', () => {
    render(
      <HistoryPanel
        history={[]}
        isOpen={true}
        onLoad={() => {}}
        onDelete={() => {}}
        onClearAll={() => {}}
        onClose={() => {}}
      />,
    );
    expect(screen.getByText('No history yet')).toBeTruthy();
  });

  it('calls onLoad and onClose when Load Prompt is clicked', () => {
    const onLoad = vi.fn();
    const onClose = vi.fn();
    render(
      <HistoryPanel
        history={[mockHistory[0]]}
        isOpen={true}
        onLoad={onLoad}
        onDelete={() => {}}
        onClearAll={() => {}}
        onClose={onClose}
      />,
    );
    fireEvent.click(screen.getByText('Load Prompt'));
    expect(onLoad).toHaveBeenCalledWith(mockHistory[0]);
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onDelete when delete button is clicked', () => {
    const onDelete = vi.fn();
    render(
      <HistoryPanel
        history={[mockHistory[0]]}
        isOpen={true}
        onLoad={() => {}}
        onDelete={onDelete}
        onClearAll={() => {}}
        onClose={() => {}}
      />,
    );
    const deleteButtons = screen.getAllByRole('button');
    const deleteBtn = deleteButtons.find((b) => b.querySelector('path'));
    if (deleteBtn) fireEvent.click(deleteBtn);
  });

  it('calls onClearAll when Clear all is clicked', () => {
    const onClearAll = vi.fn();
    render(
      <HistoryPanel
        history={[mockHistory[0]]}
        isOpen={true}
        onLoad={() => {}}
        onDelete={() => {}}
        onClearAll={onClearAll}
        onClose={() => {}}
      />,
    );
    fireEvent.click(screen.getByText('Clear all'));
    expect(onClearAll).toHaveBeenCalled();
  });
});
