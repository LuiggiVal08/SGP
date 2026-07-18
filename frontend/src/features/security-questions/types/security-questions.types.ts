export interface SecurityQuestion {
  id: string;
  questionText: string;
  active: boolean;
}

export interface UserSecurityQuestion {
  id: string;
  questionId: string;
  questionText: string;
}

export interface SetSecurityQuestionsPayload {
  questions: Array<{ questionId: string; answer: string }>;
}

export interface ForgotPasswordInitResponse {
  questions: Array<{ id: string; questionText: string }>;
}

export interface ForgotPasswordVerifyResponse {
  resetToken: string;
}
