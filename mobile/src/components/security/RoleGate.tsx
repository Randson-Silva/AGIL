import { useAuth } from '../../hooks/useAuth';

interface Props {
  allowedProfiles: ('TECNICO' | 'PROFESSOR' | 'ALUNO')[];
  children: React.ReactNode;
}

export function RoleGate({ allowedProfiles, children }: Props) {
  const { user } = useAuth();

  if (!user || !user.profile || !allowedProfiles.includes(user.profile)) {
    return null;
  }

  return <>{children}</>;
}
