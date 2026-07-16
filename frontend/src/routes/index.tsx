/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { RootLayout } from '@/layouts/RootLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { suspense } from './suspense';

const LoginPage = lazy(() => import('@/features/auth/views/LoginPage'));
const ForgotPasswordPage = lazy(() => import('@/features/auth/views/ForgotPasswordPage'));
const DashboardPage = lazy(() => import('@/features/projects/views/DashboardPage'));
const CreateProjectPage = lazy(() => import('@/features/projects/views/CreateProjectPage'));
const ProjectsListPage = lazy(() => import('@/features/projects/views/ProjectsListPage'));
const ProjectDetailPage = lazy(() => import('@/features/projects/views/ProjectDetailPage'));
const AntecedentesPage = lazy(() => import('@/features/projects/views/AntecedentesPage'));
const ProfilePage = lazy(() => import('@/features/profile/views/ProfilePage'));
const NotFoundPage = lazy(() => import('@/features/not-found/views/NotFoundPage'));
const AdminPnfPage = lazy(() => import('@/features/admin/views/AdminPnfPage'));
const AdminInstitutionsPage = lazy(() => import('@/features/admin/views/AdminInstitutionsPage'));
const AdminPeriodsPage = lazy(() => import('@/features/admin/views/AdminPeriodsPage'));
const AdminTrajectoriesPage = lazy(() => import('@/features/admin/views/AdminTrajectoriesPage'));
const AdminSubjectsPage = lazy(() => import('@/features/admin/views/AdminSubjectsPage'));
const AdminCommunityPlacesPage = lazy(() => import('@/features/admin/views/AdminCommunityPlacesPage'));
const AdminCommunityTutorsPage = lazy(() => import('@/features/admin/views/AdminCommunityTutorsPage'));
const AdminTagsPage = lazy(() => import('@/features/admin/views/AdminTagsPage'));
const AdminUsersPage = lazy(() => import('@/features/admin/views/AdminUsersPage'));
const AdminUserRegisterPage = lazy(() => import('@/features/admin/views/AdminUserRegisterPage'));
const RegisterStudentPage = lazy(() => import('@/features/admin/views/RegisterStudentPage'));
const RegisterProfessorPage = lazy(() => import('@/features/admin/views/RegisterProfessorPage'));
const HelpPage = lazy(() => import('@/features/help/views/HelpPage'));
const ActivityLogPage = lazy(() => import('@/features/activity-log/views/ActivityLogPage'));
const LoopDashboardPage = lazy(() => import('@/features/loop-dashboard/views/LoopDashboardPage'));

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <ErrorBoundary>{suspense(<LoginPage />)}</ErrorBoundary>,
  },
  {
    path: '/forgot-password',
    element: <ErrorBoundary>{suspense(<ForgotPasswordPage />)}</ErrorBoundary>,
  },
  {
    path: '/',
    element: (
      <ErrorBoundary>
        <ProtectedRoute>
          <RootLayout />
        </ProtectedRoute>
      </ErrorBoundary>
    ),
    children: [
      { index: true, element: suspense(<DashboardPage />) },
      { path: 'profile', element: suspense(<ProfilePage />) },
      { path: 'help', element: suspense(<HelpPage />) },
      { path: 'projects', element: suspense(<ProjectsListPage />) },
      { path: 'antecedentes', element: suspense(<AntecedentesPage />) },
      { path: 'projects/new', element: suspense(<CreateProjectPage />) },
      { path: 'projects/:id', element: suspense(<ProjectDetailPage />) },
      {
        path: 'admin/pnf',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'IRCOP']}>
            {suspense(<AdminPnfPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/institutions',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'IRCOP']}>
            {suspense(<AdminInstitutionsPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/periods',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'IRCOP']}>
            {suspense(<AdminPeriodsPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/trajectories',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'IRCOP']}>
            {suspense(<AdminTrajectoriesPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/subjects',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'IRCOP']}>
            {suspense(<AdminSubjectsPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/tags',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'IRCOP']}>
            {suspense(<AdminTagsPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/community-places',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'IRCOP']}>
            {suspense(<AdminCommunityPlacesPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/community-tutors',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'IRCOP']}>
            {suspense(<AdminCommunityTutorsPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/users',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'IRCOP']}>
            {suspense(<AdminUsersPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/users/register',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'IRCOP']}>
            {suspense(<AdminUserRegisterPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/students/register',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'IRCOP']}>
            {suspense(<RegisterStudentPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/professors/register',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'IRCOP']}>
            {suspense(<RegisterProfessorPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/activity-log',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'IRCOP']}>
            {suspense(<ActivityLogPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/loop',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'IRCOP']}>
            {suspense(<LoopDashboardPage />)}
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <ErrorBoundary>{suspense(<NotFoundPage />)}</ErrorBoundary>,
  },
]);
