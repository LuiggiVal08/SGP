import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { useAuthStore } from '@/shared/store/auth.store';
import type { AuthUser } from '@/shared/types/auth.types';

const mockUser: AuthUser = {
  id: '1',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  role: 'STUDENT',
};

function renderProtected(allowedRoles?: string[]) {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <ProtectedRoute allowedRoles={allowedRoles}>
        <div data-testid="protected-content">Content</div>
      </ProtectedRoute>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
  });

  it('should render nothing when not authenticated', () => {
    const { container } = renderProtected();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(container.textContent).toBe('');
  });

  it('should render children when authenticated', () => {
    useAuthStore.setState({ user: mockUser, token: 'token', isAuthenticated: true });
    renderProtected();
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('should render nothing when role not allowed', () => {
    useAuthStore.setState({ user: mockUser, token: 'token', isAuthenticated: true });
    const { container } = renderProtected(['ADMIN']);
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(container.textContent).toBe('');
  });

  it('should render children when role is allowed', () => {
    useAuthStore.setState({ user: { ...mockUser, role: 'ADMIN' }, token: 'token', isAuthenticated: true });
    renderProtected(['ADMIN']);
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('should allow any role when no allowedRoles specified', () => {
    useAuthStore.setState({ user: { ...mockUser, role: 'TUTOR' }, token: 'token', isAuthenticated: true });
    renderProtected();
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });
});
