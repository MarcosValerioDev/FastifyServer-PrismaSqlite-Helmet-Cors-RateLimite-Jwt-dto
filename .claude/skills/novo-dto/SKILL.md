---
name: novo-dto
description: Cria ou altera DTOs (Data Transfer Objects) de entrada com class-validator/class-transformer ou DTOs de resposta neste projeto. Use ao adicionar campos validados, novos payloads de rota, query params ou formatos de resposta.
---

# Novo DTO

## DTO de entrada (body / params / query)

Arquivo `src/modules/<modulo>/dto/<acao>-<entidade>.dto.ts`:

```ts
import { Transform, Type } from 'class-transformer';
import { IsEmail, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreateProdutoDto {
  @IsString({ message: 'nome deve ser texto' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Length(2, 120, { message: 'nome deve ter entre 2 e 120 caracteres' })
  nome: string;

  @Type(() => Number)           // necessário p/ query string e params (chegam como string)
  @IsInt({ message: 'estoque deve ser inteiro' })
  @Min(0, { message: 'estoque não pode ser negativo' })
  estoque: number;

  @IsOptional()
  @IsString()
  descricao?: string;
}
```

Regras:
- **Toda** propriedade precisa de ao menos um decorator — sem decorator ela é removida pelo `whitelist` e, se enviada, gera 400 (`forbidNonWhitelisted`).
- Mensagens de erro em português, no formato `<campo> deve ...`.
- E-mails: `@Transform` para `trim().toLowerCase()` antes do `@IsEmail`.
- Senhas: `@MinLength(8)` e `@MaxLength(72)` (limite do bcrypt).
- Para objetos aninhados: `@ValidateNested()` + `@Type(() => OutroDto)`.
- Paginação/filtros: crie um `QueryDto` e use `validateDto(QueryDto, 'query')`.
- Reaproveite `src/common/dto/id-param.dto.ts` para `/:id`.

Uso na rota:
```ts
app.post('/', { preValidation: [validateDto(CreateProdutoDto)] }, controller.create);
app.get('/', { preValidation: [validateDto(ListProdutosQueryDto, 'query')] }, controller.findAll);
```

No controller, tipar: `FastifyRequest<{ Body: CreateProdutoDto }>` (import `type`).

## DTO de resposta

```ts
export class ProdutoResponseDto {
  id: string;
  nome: string;
  createdAt: Date;

  static fromEntity(p: Produto): ProdutoResponseDto {
    const dto = new ProdutoResponseDto();
    dto.id = p.id;
    dto.nome = p.nome;
    dto.createdAt = p.createdAt;
    return dto;
  }
}
```

Nunca inclua campos sensíveis (hashes, tokens, segredos). Copie campo a campo — não use spread da entidade.

Depois: `npm run typecheck`.
