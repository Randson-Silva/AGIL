import { RoleType } from '@/components/auth/RoleSelect';

export const verifyEmailProfile = (email: string): RoleType => {
  const domain = email.includes('@aluno');

  return domain ? 'ALUNO' : 'TECNICO';
};
