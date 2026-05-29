import { render, screen } from '@testing-library/react';
import { EmptyState } from '@/shared/components/EmptyState';

describe('EmptyState', () => {
  it('should render default message', () => {
    render(<EmptyState />);
    expect(screen.getByText('Sin datos')).toBeInTheDocument();
  });

  it('should render custom message', () => {
    render(<EmptyState message="No hay resultados" />);
    expect(screen.getByText('No hay resultados')).toBeInTheDocument();
  });

  it('should render custom icon', () => {
    render(<EmptyState icon={<span data-testid="custom-icon">🔍</span>} />);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });
});
