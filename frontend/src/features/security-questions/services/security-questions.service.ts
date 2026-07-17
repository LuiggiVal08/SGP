import axiosClient from '@/shared/api/axiosClient';
import type {
  SecurityQuestion,
  UserSecurityQuestion,
  SetSecurityQuestionsPayload,
  ForgotPasswordInitResponse,
  ForgotPasswordVerifyResponse,
} from '../types/security-questions.types';

export const securityQuestionsService = {
  async getAvailableQuestions(signal?: AbortSignal): Promise<SecurityQuestion[]> {
    const { data } = await axiosClient.get<SecurityQuestion[]>('/security-questions', { signal });
    return data;
  },

  async getMyQuestions(signal?: AbortSignal): Promise<UserSecurityQuestion[]> {
    const { data } = await axiosClient.get<UserSecurityQuestion[]>('/users/me/security-questions', { signal });
    return data;
  },

  async setMyQuestions(payload: SetSecurityQuestionsPayload, signal?: AbortSignal): Promise<void> {
    await axiosClient.post('/users/me/security-questions', payload, { signal });
  },

  async forgotPasswordInit(payload: { email: string }, signal?: AbortSignal): Promise<ForgotPasswordInitResponse> {
    const { data } = await axiosClient.post<ForgotPasswordInitResponse>('/auth/forgot-password/init', payload, { signal });
    return data;
  },

  async forgotPasswordVerify(payload: { resetToken: string; answers: Array<{ questionId: string; answer: string }> }, signal?: AbortSignal): Promise<ForgotPasswordVerifyResponse> {
    const { data } = await axiosClient.post<ForgotPasswordVerifyResponse>('/auth/forgot-password/verify', payload, { signal });
    return data;
  },

  async forgotPasswordReset(payload: { verificationToken: string; newPassword: string }, signal?: AbortSignal): Promise<void> {
    await axiosClient.post('/auth/forgot-password/reset', payload, { signal });
  },

  async changePassword(payload: { currentPassword: string; newPassword: string }, signal?: AbortSignal): Promise<void> {
    await axiosClient.post('/auth/change-password', payload, { signal });
  },
};
