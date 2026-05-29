import { Navigate } from 'react-router';
import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/layouts/RootLayout';
import { ProtectedRoute } from './ProtectedRoute';
import LoginPage from '@/features/auth/views/LoginPage';
import DashboardPage from '@/features/projects/views/DashboardPage';
import CreateProjectPage from '@/features/projects/views/CreateProjectPage';
import ProjectDetailPage from '@/features/projects/views/ProjectDetailPage';
import ProfilePage from '@/features/profile/views/ProfilePage';
import {
  AdminCareersPage,
  AdminInstitutionsPage,
  AdminUsersPage,
} from '@/features/admin';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <RootLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'projects/new', element: <CreateProjectPage /> },
      { path: 'projects/:id', element: <ProjectDetailPage /> },
      {
        path: 'admin/careers',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminCareersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/institutions',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminInstitutionsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/users',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminUsersPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
