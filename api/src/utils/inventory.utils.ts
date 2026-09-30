import { BadRequestException } from '@nestjs/common';

export function validateMeasurementUnit(
  measurementUnit: string,
  amount: number,
): void {
  if (measurementUnit === 'UN' && amount % 1 !== 0) {
    throw new BadRequestException(
      'Itens medidos em Unidades (UN) não podem ter valores decimais.',
    );
  }
}

export function hasValidUpdates(childObject: Record<string, any>): boolean {
  return Object.values(childObject).some(
    (val) => val !== undefined && val !== null,
  );
}
