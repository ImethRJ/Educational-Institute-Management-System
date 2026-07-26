import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GlobalSearchModal } from './global-search.modal';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('GlobalSearchModal', () => {
  it('should not render anything when isOpen is false', () => {
    const { container } = render(
      <GlobalSearchModal isOpen={false} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render search input and quick actions when isOpen is true', () => {
    render(<GlobalSearchModal isOpen={true} onClose={vi.fn()} />, {
      wrapper: createWrapper(),
    });

    const searchInput = screen.getByPlaceholderText(
      /Type student name\/code, teacher, or quick action.../i
    );
    expect(searchInput).toBeInTheDocument();

    expect(screen.getByText('New Student Admission (F1)')).toBeInTheDocument();
    expect(screen.getByText('Cashier Billing Counter (F2)')).toBeInTheDocument();
  });

  it('should call onClose when Escape key is pressed', () => {
    const handleClose = vi.fn();
    render(<GlobalSearchModal isOpen={true} onClose={handleClose} />, {
      wrapper: createWrapper(),
    });

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should filter quick actions based on search term', () => {
    render(<GlobalSearchModal isOpen={true} onClose={vi.fn()} />, {
      wrapper: createWrapper(),
    });

    const searchInput = screen.getByPlaceholderText(
      /Type student name\/code, teacher, or quick action.../i
    );

    fireEvent.change(searchInput, { target: { value: 'Cashier' } });

    expect(screen.getByText('Cashier Billing Counter (F2)')).toBeInTheDocument();
    expect(screen.queryByText('Executive Summary Dashboard')).not.toBeInTheDocument();
  });
});
