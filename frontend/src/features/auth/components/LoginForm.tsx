import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Button } from '@heroui/react';
import { loginSchema, type LoginFormData } from '../schemas/login.schema';
import { useAuthStore } from '@/shared/store/auth.store';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { AxiosError } from 'axios';
import { LogIn } from 'lucide-react';

export function LoginForm() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError('');
    try {
      await login(data);
      navigate('/', { replace: true });
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 401) {
        setError('Credenciales inválidas');
      } else {
        setError('Error inesperado. Intente nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full max-w-sm">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
        <Input
          id="email"
          type="email"
          placeholder="correo@institucion.edu"
          {...register('email')}
          className="[&_[data-slot=input-wrapper]]:bg-surface-secondary/50 [&_[data-slot=input-wrapper]]:backdrop-blur-sm"
        />
        {errors.email && <p className="text-danger text-xs mt-0.5">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-foreground">Contraseña</label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          {...register('password')}
          className="[&_[data-slot=input-wrapper]]:bg-surface-secondary/50 [&_[data-slot=input-wrapper]]:backdrop-blur-sm"
        />
        {errors.password && <p className="text-danger text-xs mt-0.5">{errors.password.message}</p>}
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
          <p className="text-danger text-sm text-center">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        isDisabled={loading}
        className="w-full h-11 font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all duration-200 active:scale-[0.98]"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Iniciando sesión…
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <LogIn size={16} />
            Iniciar sesión
          </span>
        )}
      </Button>
    </form>
  );
}
