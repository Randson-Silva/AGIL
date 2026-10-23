import { useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from './useAuth';
import { User } from '../contexts/AuthContext';

const ROLE_LABELS: Record<User['profile'], string> = {
  TECNICO: 'Técnico',
  PROFESSOR: 'Professor',
  ALUNO: 'Aluno',
};

const ROLE_PERMISSIONS: Record<User['profile'], string[]> = {
  TECNICO: [
    'Aprovar reservas e solicitações',
    'Cadastrar itens no inventário',
    'Painel administrativo e relatórios',
    'Receber alertas de avaria e estoque baixo',
  ],
  PROFESSOR: [
    'Reservar laboratório',
    'Solicitar materiais',
    'Reportar avarias',
    'Ver histórico próprio',
  ],
  ALUNO: [
    'Solicitar reserva para pesquisa/TCC',
    'Consultar disponibilidade de laboratórios',
    'Reportar avarias',
    'Ver histórico próprio',
  ],
};

export function useProfile() {
  const { user, firstName, initials, signOut } = useAuth();
  const router = useRouter();

  const role = user?.profile || 'ALUNO';

  const displayName = useMemo(() => {
    const trimmed = user?.name?.trim();
    return trimmed || firstName;
  }, [user?.name, firstName]);

  const email = user?.email || '';
  const roleLabel = ROLE_LABELS[role] || 'Usuário';
  const permissions = ROLE_PERMISSIONS[role] || [];

  const handleLogout = useCallback(async () => {
    await signOut();
    router.replace('/(public)/login');
  }, [signOut, router]);

  return {
    displayName,
    email,
    firstName,
    initials,
    roleLabel,
    permissions,
    handleLogout,
  };
}
