import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Button, Spinner } from '@heroui/react';
import { loginSchema, type LoginFormData } from '../schemas/login.schema';
import { sileo } from 'sileo';
import { useAuthStore } from '@/shared/store/auth.store';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { AxiosError } from 'axios';
import { LogIn } from 'lucide-react';
import { PasswordInput } from '@/shared/components/PasswordInput';
import { FieldLabel } from '@/shared/components/FieldLabel';

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
      sileo.success({ title: 'Inicio de sesión exitoso', description: 'Bienvenido al sistema.' });
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
        <FieldLabel label="Email" help="Correo institucional" htmlFor="email" className="text-sm font-medium text-foreground" />
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
        <FieldLabel label="Contraseña" help="Mínimo 6 caracteres" htmlFor="password" className="text-sm font-medium text-foreground" />
        <PasswordInput
          id="password"
          placeholder="••••••••"
          {...register('password')}
          className="[&_[data-slot=input-wrapper]]:bg-surface-secondary/50 [&_[data-slot=input-wrapper]]:backdrop-blur-sm"
        />
        {errors.password && <p className="text-danger text-xs mt-0.5">{errors.password.message}</p>}
        <Link to="/forgot-password" className="text-sm text-primary hover:underline self-center -mt-1.5">
          ¿Olvidaste tu contraseña?
        </Link>
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
          <Spinner size="sm" />
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
