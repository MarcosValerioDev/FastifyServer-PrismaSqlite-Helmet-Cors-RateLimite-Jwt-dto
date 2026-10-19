---
name: novo-modulo
description: Cria um novo módulo de recurso (CRUD) neste servidor Fastify seguindo o padrão do projeto — model Prisma, DTOs com class-validator, repository, service, controller e rotas. Use quando o usuário pedir uma nova entidade, recurso, tabela com endpoints ou "módulo".
---

# Novo módulo

Use o módulo `src/modules/users/` como referência canônica. Leia-o antes de começar.

## Passos

1. **Model** — adicione o model em `prisma/schema.prisma` (id `String @id @default(uuid())`, `createdAt @default(now())`, `updatedAt @updatedAt`, `@@map("<tabela_plural>")`). Depois siga a skill `prisma-migration`.

2. **DTOs** em `src/modules/<modulo>/dto/`:
   - `create-<entidade>.dto.ts` — campos obrigatórios com decorators do class-validator e mensagens em português.
   - `update-<entidade>.dto.ts` — mesmos campos com `@IsOptional()`.
   - `<entidade>-response.dto.ts` — classe com `static fromEntity(entity)` que copia só os campos públicos.
   - Detalhes de padrão: skill `novo-dto`.

3. **Repository** `<modulo>.repository.ts` — classe que recebe `PrismaClient` no construtor; é o **único** lugar que chama `this.prisma.<model>`. Tipos vêm de `../../../generated/prisma/client`.

4. **Service** `<modulo>.service.ts` — recebe o repository; aplica regras; lança `NotFoundError`, `ConflictError`, `ForbiddenError` etc. de `src/common/errors/app-error.ts`; retorna sempre ResponseDto.

5. **Controller** `<modulo>.controller.ts` — handlers como **arrow functions** (para manter o `this`), tipados com `FastifyRequest<{ Params; Body; Querystring }>`. Sem regra de negócio.

6. **Rotas** `<modulo>.routes.ts`:
   ```ts
   export async function produtosRoutes(app: FastifyInstance) {
     const controller = new ProdutosController(new ProdutosService(new ProdutosRepository(app.prisma)));
     app.addHook('onRequest', app.authenticate); // se for protegido
     app.post('/', { preValidation: [validateDto(CreateProdutoDto)] }, controller.create);
     app.get('/:id', { preValidation: [validateDto(IdParamDto, 'params')] }, controller.findById);
   }
   ```

7. **Registrar** em `src/app.ts`: `await app.register(produtosRoutes, { prefix: '/produtos' });`

8. **Verificar**: `npm run typecheck` e depois a skill `testar-api` para as novas rotas.

9. Atualize a tabela de endpoints no `README.md`.

## Checklist

- [ ] Nenhuma rota recebe body/params sem `validateDto`
- [ ] Nenhuma resposta retorna entidade Prisma crua
- [ ] Rotas que alteram dados do usuário verificam dono (`request.user.sub`)
- [ ] Typecheck passando
