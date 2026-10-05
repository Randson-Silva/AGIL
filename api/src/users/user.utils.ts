import { ConfigService } from '@nestjs/config';
import { emailDomainsConfiguration } from '../auth/auth.utils.js';
import { Role } from '../authz/roles.js';

export function hasRightRoleAndEmail(
  role: Role,
  email: string,
  configService: ConfigService,
): boolean {
  const { studentDomain, teacherAndTechDomain } =
    emailDomainsConfiguration(configService);

  if (role === 'ALUNO') {
    return email.endsWith(studentDomain);
  }

  if (role === 'PROFESSOR' || role === 'TECNICO') {
    return email.endsWith(teacherAndTechDomain);
  }

  return false;
}
