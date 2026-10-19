---
name: prisma-migration
description: Altera o schema Prisma (SQLite) e gera migration + client neste projeto. Use ao criar/alterar models, campos, índices ou relações, ou quando o client Prisma estiver desatualizado/ausente.
---

# Migration Prisma (v7 + SQLite)

## Contexto do projeto

- Schema: `prisma/schema.prisma` (generator `prisma-client`, `moduleFormat = "cjs"`, output `../generated/prisma`).
- Config da CLI: `prisma.config.ts` — lê `DATABASE_URL` do `.env`. O datasource **não** tem `url` no schema (Prisma 7).
- Runtime usa o driver adapter `PrismaBetterSqlite3` em `src/plugins/prisma.ts`.
- Banco local: `prisma/dev.db` (gitignored).

## Passos

1. Edite `prisma/schema.prisma`. Convenções:
   - `id String @id @default(uuid())`
   - `createdAt DateTime @default(now())` e `updatedAt DateTime @updatedAt`
   - Nome de tabela com `@@map("snake_case_plural")`
   - Campos únicos com `@unique`; índices com `@@index([...])`
2. `npx prisma format` e `npx prisma validate`.
3. `npx prisma migrate dev --name <descricao_em_snake_case>`
4. **Obrigatório no Prisma 7:** `npx prisma generate` (o migrate dev não gera mais o client).
5. `npm run typecheck` — ajuste repository/DTOs que quebrarem.
6. Commite a pasta `prisma/migrations/` junto com o schema.

## Cuidados

- **Nunca** rode `prisma migrate reset` ou apague `prisma/dev.db` sem confirmação explícita do usuário — destrói dados.
- Campo novo obrigatório em tabela com dados: dê `@default(...)` ou crie como opcional primeiro.
- SQLite tem suporte limitado a `ALTER TABLE`; o Prisma recria a tabela — revise o `migration.sql` gerado.
- Em produção use `npm run prisma:deploy` (`migrate deploy`), nunca `migrate dev`.
