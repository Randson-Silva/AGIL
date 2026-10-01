import { Role } from '../authz/roles.js';

export function hasRightRoleAndEmail(role: Role, email: string): boolean {
  if (!email.includes('aluno') && role === 'ALUNO') return false;

  if (email.includes('aluno') && role !== 'ALUNO') return false;

  return true;
}
