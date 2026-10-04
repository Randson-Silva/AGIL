import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

const salt = 10;

export async function hash(value: string, saltNumber?: number) {
  const hashed = saltNumber
    ? await bcrypt.hash(value, saltNumber)
    : await bcrypt.hash(value, salt);

  return hashed;
}

export async function compare(plaintext: string, hashed: string) {
  const comparison = await bcrypt.compare(plaintext, hashed);

  return comparison;
}

export function emailDomainsConfiguration(configService: ConfigService) {
  const isNotProduction =
    configService.get<string>('NODE_ENV') !== 'production';

  return isNotProduction
    ? {
        studentDomain: '@alu.ufc.br',
        teacherAndTechDomain: '@gmail.com',
      }
    : {
        studentDomain: '@aluno.ifce.edu.br',
        teacherAndTechDomain: '@ifce.edu.br',
      };
}
