import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from '@/shared/components/Pagination';

describe('Pagination', () => {
  it('should not render when total <= 1', () => {
    const { container } = render(<Pagination current={1} total={1} onChange={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render page numbers', () => {
    render(<Pagination current={1} total={3} onChange={vi.fn()} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should call onChange when clicking a page', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Pagination current={1} total={3} onChange={onChange} />);
    await user.click(screen.getByText('2'));
    expect(onChange).toHaveBeenCalledWith(2);
  });
});
