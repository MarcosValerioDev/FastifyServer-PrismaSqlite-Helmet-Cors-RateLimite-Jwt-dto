import type { ClassConstructor } from 'class-transformer';
import { getMetadataStorage } from 'class-validator';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';

// O class-transformer não exporta tipos para o storage; ele é necessário
// para que @Type(() => OutroDto) vire $ref no schema.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { defaultMetadataStorage } = require('class-transformer/cjs/storage');

const REF_PREFIX = '#/components/schemas/';

type JsonSchema = Record<string, unknown>;

let cache: Record<string, JsonSchema> | undefined;

/**
 * Gera os JSON Schemas de todos os DTOs a partir dos decorators do class-validator.
 * Deve ser chamado depois que os DTOs foram importados (ao registrar os plugins/rotas).
 */
export function dtoSchemas(): Record<string, JsonSchema> {
  cache ??= validationMetadatasToSchemas({
    classValidatorMetadataStorage: getMetadataStorage(),
    classTransformerMetadataStorage: defaultMetadataStorage,
    refPointerPrefix: REF_PREFIX,
  }) as Record<string, JsonSchema>;
  return cache;
}

/** Referência ao DTO em `components.schemas` — use em body e response. */
export function ref(dto: ClassConstructor<object>): JsonSchema {
  return { $ref: `${REF_PREFIX}${dto.name}` };
}

/** Lista de DTOs (response de arrays). */
export function arrayOf(dto: ClassConstructor<object>): JsonSchema {
  return { type: 'array', items: ref(dto) };
}

/** Schema do DTO inline — obrigatório para params e querystring no OpenAPI. */
export function inline(dto: ClassConstructor<object>): JsonSchema {
  const schema = dtoSchemas()[dto.name];
  if (!schema) throw new Error(`Schema do DTO ${dto.name} não encontrado`);
  return schema;
}

export const bearerAuth = [{ bearerAuth: [] }];
