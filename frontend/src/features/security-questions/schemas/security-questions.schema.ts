import { z } from 'zod';

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Mínimo 6 caracteres'),
    newPassword: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmPassword: z.string().min(6, 'Mínimo 6 caracteres'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export const securityQuestionsSchema = z
  .object({
    question1: z.string().uuid('Seleccione una pregunta'),
    answer1: z.string().min(2, 'Mínimo 2 caracteres'),
    question2: z.string().uuid('Seleccione una pregunta'),
    answer2: z.string().min(2, 'Mínimo 2 caracteres'),
    question3: z.string().uuid('Seleccione una pregunta'),
    answer3: z.string().min(2, 'Mínimo 2 caracteres'),
  })
  .refine(
    (data) => {
      const ids = [data.question1, data.question2, data.question3];
      return new Set(ids).size === 3;
    },
    {
      message: 'Las preguntas deben ser distintas',
      path: ['question3'],
    },
  );

export type SecurityQuestionsFormValues = z.infer<typeof securityQuestionsSchema>;

export const forgotPasswordEmailSchema = z.object({
  email: z.string().email('Email inválido'),
});

export type ForgotPasswordEmailValues = z.infer<typeof forgotPasswordEmailSchema>;

export const forgotPasswordAnswersSchema = z.object({
  answer1: z.string().min(2, 'Mínimo 2 caracteres'),
  answer2: z.string().min(2, 'Mínimo 2 caracteres'),
  answer3: z.string().min(2, 'Mínimo 2 caracteres'),
});

export type ForgotPasswordAnswersValues = z.infer<typeof forgotPasswordAnswersSchema>;

export const forgotPasswordResetSchema = z
  .object({
    newPassword: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmPassword: z.string().min(6, 'Mínimo 6 caracteres'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type ForgotPasswordResetValues = z.infer<typeof forgotPasswordResetSchema>;
