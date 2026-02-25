import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

/**
 * Pipe para validar UUID v4
 */
@Injectable()
export class ParseUuidPipe implements PipeTransform<string> {
  private readonly uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  transform(value: string): string {
    if (!this.uuidRegex.test(value)) {
      throw new BadRequestException(`"${value}" nao e um UUID valido`);
    }
    return value;
  }
}

/**
 * Pipe para limpar e validar CPF/CNPJ
 */
@Injectable()
export class ParseDocumentPipe implements PipeTransform<string> {
  transform(value: string): string {
    const limpo = value.replace(/\D/g, '');
    if (limpo.length !== 11 && limpo.length !== 14) {
      throw new BadRequestException('Documento deve ter 11 (CPF) ou 14 (CNPJ) digitos');
    }
    return limpo;
  }
}

export { ParseUuidPipe as ParseUUIDPipe };
