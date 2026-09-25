import { useAuth } from '../../hooks/useAuth';

interface Props {
  perfisPermitidos: ('TECNICO' | 'PROFESSOR' | 'ALUNO')[];
  children: React.ReactNode;
}

export function RoleGate({ perfisPermitidos, children }: Props) {
  const { user } = useAuth();

  if (!user || !perfisPermitidos.includes(user.profile)) {
    return null; // não renderiza o componente se o perfil não estiver autorizado
  }

  return <>{children}</>;
}
