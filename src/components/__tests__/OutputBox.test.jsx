import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OutputBox from '../OutputBox';

beforeEach(() => {
  vi.restoreAllMocks();
  Element.prototype.scrollIntoView = vi.fn();
  Object.assign(navigator, {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
  });
});

describe('OutputBox', () => {
  it('renders empty state when no output', () => {
    render(<OutputBox output="" onRegenerate={() => {}} loading={false} />);
    expect(screen.getByText('Ready to generate')).toBeTruthy();
    expect(screen.getByText(/Fill in at least/)).toBeTruthy();
  });

  it('renders output text when provided', () => {
    render(<OutputBox output="Generated prompt content" onRegenerate={() => {}} loading={false} />);
    expect(screen.getByText('Generated Prompt')).toBeTruthy();
    const textarea = screen.getByDisplayValue('Generated prompt content');
    expect(textarea).toBeTruthy();
  });

  it('shows character count when output exists', () => {
    render(<OutputBox output="hello" onRegenerate={() => {}} loading={false} />);
    expect(screen.getByText('5 chars')).toBeTruthy();
  });

  it('shows regenerate button when output exists', () => {
    render(<OutputBox output="some output" onRegenerate={() => {}} loading={false} />);
    expect(screen.getByText('Regenerate')).toBeTruthy();
  });

  it('disables regenerate button when loading', () => {
    render(<OutputBox output="some output" onRegenerate={() => {}} loading={true} />);
    expect(screen.getByText('Regenerate')).toBeTruthy();
  });

  it('copies main text to clipboard on Copy click', async () => {
    render(<OutputBox output="copy me" onRegenerate={() => {}} loading={false} />);
    const copyButtons = screen.getAllByText('Copy');
    fireEvent.click(copyButtons[0]);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('copy me');
    await waitFor(() => {
      expect(screen.getByText('Copied')).toBeTruthy();
    });
  });

  it('renders git branch and commit suggestions with individual copy buttons', async () => {
    render(<OutputBox output="copy me" onRegenerate={() => {}} loading={false} />);
    expect(screen.getByText('Suggested Git Branches')).toBeTruthy();
    expect(screen.getByText('Suggested Git Commit Messages')).toBeTruthy();

    const copyButtons = screen.getAllByText('Copy');
    // Click a branch copy button (2nd copy button)
    fireEvent.click(copyButtons[1]);
    await waitFor(() => {
      expect(screen.getByText('Copied')).toBeTruthy();
    });
  });

  it('shows loading overlay when loading is true', () => {
    render(<OutputBox output="" onRegenerate={() => {}} loading={true} />);
    expect(screen.getByText('Writing prompt…')).toBeTruthy();
  });
});
