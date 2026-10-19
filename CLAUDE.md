# CLAUDE.md

Guia para o Claude Code trabalhar neste repositório. **Comunique-se sempre em Português (Brasil).**

## Stack

- **Fastify 5** + **TypeScript** (compilado para CommonJS)
- **Prisma 7** com **SQLite** via driver adapter `@prisma/adapter-better-sqlite3`
- Segurança: `@fastify/helmet`, `@fastify/cors`, `@fastify/rate-limit`
- Autenticação: `@fastify/jwt` + `bcryptjs`
- Validação: **padrão DTO** com `class-validator` + `class-transformer`

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Sobe o servidor com hot reload (tsx watch) |
| `npm run typecheck` | Checagem de tipos (`tsc --noEmit`) — rode após qualquer alteração |
| `npm run build` | `prisma generate` + `tsc` → `dist/` |
| `npm start` | Roda o build (`dist/src/server.js`) |
| `npm run prisma:migrate -- --name <nome>` | Cria e aplica migration (dev) |
| `npm run prisma:generate` | Regera o client em `generated/prisma` |

> No Prisma 7 o `migrate dev` **não** roda o `generate` sozinho — sempre rode `npm run prisma:generate` depois de mudar o schema.

## Arquitetura

```
src/
  server.ts               # bootstrap (listen + graceful shutdown)
  app.ts                  # buildApp(): plugins, error handler, rotas
  config/env.ts           # leitura/validação das variáveis de ambiente
  plugins/                # fastify-plugin: prisma, security (helmet/cors/rate-limit), auth (jwt)
  common/
    errors/               # AppError + subclasses e errorHandler global
    validation/           # validateDto(Dto, 'body' | 'params' | 'query')
    dto/                  # DTOs compartilhados (IdParamDto)
    security/password.ts  # hash/compare com bcrypt
  modules/<modulo>/
    dto/                  # DTOs de entrada (class-validator) e de saída (ResponseDto)
    <modulo>.repository.ts  # único lugar que acessa o Prisma
    <modulo>.service.ts     # regra de negócio, lança AppError
    <modulo>.controller.ts  # handlers (arrow functions) — só orquestram request/reply
    <modulo>.routes.ts      # monta dependências e registra rotas
  types/fastify.d.ts      # augment de FastifyInstance e payload do JWT
generated/prisma/         # client gerado (gitignored)
prisma/schema.prisma      # modelos
prisma.config.ts          # config do Prisma CLI (schema, migrations, DATABASE_URL)
```

Fluxo: `routes → (preValidation: validateDto) → controller → service → repository → prisma`.

## Convenções

- **Toda entrada é validada por DTO** via `preValidation: [validateDto(MeuDto)]`. Params com `validateDto(IdParamDto, 'params')`. A validação usa `whitelist` + `forbidNonWhitelisted`: campos extras → 400.
- **Saída sempre via ResponseDto** (`UserResponseDto.fromEntity`). Nunca retorne entidade Prisma crua — o `passwordHash` jamais pode vazar.
- **Erros**: lance subclasses de `AppError` (`NotFoundError`, `ConflictError`, ...). O `errorHandler` padroniza `{ statusCode, error, message, details? }`. Erros Prisma `P2002`→409 e `P2025`→404 já são tratados.
- **Rotas protegidas**: `app.addHook('onRequest', app.authenticate)` no plugin do módulo; o usuário logado fica em `request.user.sub`.
- **Rate limit específico**: `config: { rateLimit: { max, timeWindow } }` na rota.
- Imports do Prisma vêm de `generated/prisma/client` (não de `@prisma/client`).
- Mensagens de erro/validação em português.
- Decorators exigem `experimentalDecorators` (já no tsconfig) e `import 'reflect-metadata'` (feito em `app.ts`).

## Skills do projeto

Em `.claude/skills/`:
- `novo-modulo` — scaffolda um módulo completo (model, DTOs, repository, service, controller, rotas)
- `novo-dto` — cria DTO de entrada/saída seguindo o padrão
- `prisma-migration` — altera o schema e gera migration + client
- `testar-api` — sobe o servidor e faz smoke test das rotas com curl
