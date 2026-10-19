# Fastify Server — Prisma SQLite · Helmet · CORS · Rate Limit · JWT · DTO · Swagger

API REST em **Fastify 5 + TypeScript** com autenticação JWT, persistência em **SQLite via Prisma 7**, validação no **padrão DTO** com `class-validator` e documentação **OpenAPI/Swagger** gerada a partir dos próprios DTOs.

## Stack

| Camada | Tecnologia |
|---|---|
| Servidor | [Fastify 5](https://fastify.dev) |
| Linguagem | TypeScript (compila para CommonJS) |
| ORM / Banco | Prisma 7 + SQLite (`@prisma/adapter-better-sqlite3`) |
| Segurança | `@fastify/helmet`, `@fastify/cors`, `@fastify/rate-limit` |
| Autenticação | `@fastify/jwt` + `bcryptjs` |
| Validação | `class-validator` + `class-transformer` (DTOs) |
| Documentação | `@fastify/swagger` + `@fastify/swagger-ui` + `class-validator-jsonschema` |

## Requisitos

- Node.js **20.19+** (testado com 24)
- npm 10+

## Como rodar

```bash
# 1. Instalar dependências (o postinstall já roda `prisma generate`)
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
#    edite o JWT_SECRET — gere um com:
#    node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# 3. Criar o banco e aplicar as migrations
npx prisma migrate deploy

# 4. Subir em desenvolvimento (hot reload)
npm run dev
```

Servidor em `http://localhost:3333` → teste com `GET /health`.

📖 **Documentação interativa (Swagger UI):** `http://localhost:3333/docs` — especificação OpenAPI em JSON: `/docs/json`.

> **npm 11+:** se o `npm install` avisar sobre *install scripts* não aprovados, rode
> `npm install-scripts approve better-sqlite3 prisma @prisma/engines esbuild` e depois `npm rebuild`.
> As aprovações já estão registradas em `allowScripts` no `package.json`.

## Scripts

| Script | Descrição |
|---|---|
| `npm run dev` | Desenvolvimento com hot reload (`tsx watch`) |
| `npm run build` | Gera o Prisma Client e compila para `dist/` |
| `npm start` | Executa o build (`dist/src/server.js`) |
| `npm run typecheck` | Checagem de tipos sem emitir arquivos |
| `npm run prisma:migrate` | Cria/aplica migration em dev (`-- --name <nome>`) |
| `npm run prisma:deploy` | Aplica migrations pendentes (produção) |
| `npm run prisma:generate` | Regera o Prisma Client |
| `npm run prisma:studio` | Abre o Prisma Studio |

## Variáveis de ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `NODE_ENV` | `development` | `development` \| `production` \| `test` |
| `HOST` | `0.0.0.0` | Host do servidor |
| `PORT` | `3333` | Porta |
| `DATABASE_URL` | — (obrigatória) | Ex.: `file:./prisma/dev.db` |
| `JWT_SECRET` | — (obrigatória) | Segredo do JWT (mín. 32 caracteres em produção) |
| `JWT_EXPIRES_IN` | `1d` | Validade do token (`15m`, `12h`, `7d`...) |
| `CORS_ORIGIN` | `*` | `*` ou lista separada por vírgula |
| `RATE_LIMIT_MAX` | `100` | Requisições por janela (global, por IP) |
| `RATE_LIMIT_WINDOW` | `1 minute` | Janela do rate limit |
| `DOCS_ENABLED` | `true` fora de produção | Expõe o Swagger UI em `/docs` |

## Modelo de dados

```prisma
model User {
  id           String   @id @default(uuid())
  name         String
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("users")
}
```

## Endpoints

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/health` | — | Status do servidor |
| `GET` | `/docs` | — | Swagger UI *(se `DOCS_ENABLED`)* |
| `POST` | `/auth/register` | — | Cria usuário e retorna token *(5 req/min)* |
| `POST` | `/auth/login` | — | Autentica e retorna token *(5 req/min)* |
| `GET` | `/users/me` | JWT | Dados do usuário logado |
| `GET` | `/users` | JWT | Lista usuários |
| `GET` | `/users/:id` | JWT | Busca usuário por id |
| `PATCH` | `/users/:id` | JWT | Atualiza `name`, `email` e/ou `password` *(somente o próprio)* |
| `DELETE` | `/users/:id` | JWT | Remove o usuário *(somente o próprio)* |

### Exemplos

```bash
# Registrar
curl -X POST http://localhost:3333/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Marcos","email":"marcos@exemplo.com","password":"senha12345"}'
```

```json
{
  "accessToken": "eyJhbGciOi...",
  "user": {
    "id": "8737246f-fe62-43bd-b32e-46cad8323b7e",
    "name": "Marcos",
    "email": "marcos@exemplo.com",
    "createdAt": "2026-10-19T18:21:54.417Z",
    "updatedAt": "2026-10-19T18:21:54.417Z"
  }
}
```

```bash
# Rota protegida
curl http://localhost:3333/users/me -H "Authorization: Bearer <accessToken>"
```

### Formato de erro

Todas as respostas de erro seguem o mesmo formato:

```json
{
  "statusCode": 400,
  "error": "BadRequestError",
  "message": "Erro de validação",
  "details": {
    "email": ["email inválido"],
    "password": ["password deve ter pelo menos 8 caracteres"]
  }
}
```

| Status | Quando |
|---|---|
| 400 | DTO inválido ou campo não permitido no body |
| 401 | Token ausente/inválido ou credenciais incorretas |
| 403 | Tentativa de alterar outro usuário |
| 404 | Recurso ou rota inexistente |
| 409 | E-mail já cadastrado |
| 429 | Rate limit excedido |

## Arquitetura

```
src/
├── server.ts                 # bootstrap + graceful shutdown
├── app.ts                    # buildApp(): plugins, error handler, rotas
├── config/env.ts             # variáveis de ambiente
├── plugins/
│   ├── prisma.ts             # PrismaClient + adapter SQLite
│   ├── security.ts           # helmet, cors, rate-limit
│   ├── auth.ts               # @fastify/jwt + decorator `authenticate`
│   └── swagger.ts            # OpenAPI + Swagger UI em /docs
├── common/
│   ├── errors/               # AppError e errorHandler global
│   ├── validation/           # validateDto() — class-validator como preValidation
│   ├── docs/openapi.ts       # DTO → JSON Schema (ref, inline, arrayOf)
│   ├── dto/                  # DTOs compartilhados (IdParam, ErrorResponse)
│   └── security/password.ts  # bcrypt
├── modules/
│   ├── auth/                 # register / login
│   └── users/                # CRUD do usuário
│       ├── dto/
│       ├── users.repository.ts
│       ├── users.service.ts
│       ├── users.controller.ts
│       ├── users.schemas.ts  # documentação Swagger das rotas
│       └── users.routes.ts
└── types/fastify.d.ts        # tipagens de FastifyInstance e JWT
```

Fluxo de uma requisição:

```
rota → preValidation (validateDto) → controller → service → repository → Prisma
                                                     ↓
                                        AppError → errorHandler → JSON padronizado
```

### Padrão DTO

- **Entrada:** classes com decorators do `class-validator`. O `validateDto` converte o payload com `plainToInstance`, valida com `whitelist` + `forbidNonWhitelisted` (campos extras geram 400) e substitui `request.body` / `params` / `query` pela instância validada.
- **Saída:** `ResponseDto.fromEntity()` garante que dados sensíveis (como `passwordHash`) nunca sejam retornados.

### Swagger a partir dos DTOs

Os JSON Schemas do OpenAPI são gerados dos decorators do `class-validator` com `class-validator-jsonschema` — o DTO é a **única fonte da verdade** para validação e documentação. Cada módulo tem um `<modulo>.schemas.ts` que referencia os DTOs:

```ts
export const registerSchema: FastifySchema = {
  tags: ['Auth'],
  summary: 'Cadastra um usuário e retorna o token',
  body: ref(RegisterDto),
  response: { 201: ref(AuthResponseDto), 400: ref(ErrorResponseDto) },
};
```

Os `schema` das rotas são **apenas documentação**: o validador e o serializador nativos do Fastify (Ajv / fast-json-stringify) foram substituídos por no-ops em `app.ts`, então quem valida é sempre o `validateDto` e as mensagens continuam em português.

## Segurança

- **Helmet** — headers HTTP seguros (CSP, X-Frame-Options, HSTS...).
- **CORS** — origens configuráveis por `CORS_ORIGIN`.
- **Rate limit** — global por IP + limite mais restrito em `/auth/*` contra força bruta.
- **Senhas** — hash com bcrypt (10 rounds); login responde a mesma mensagem para e-mail ou senha incorretos.
- **JWT** — assinado com `JWT_SECRET`, com expiração configurável; `.env` fora do Git.
- **Swagger** — desativado por padrão em produção (`DOCS_ENABLED`); usa CSP própria em `/docs`.

## Claude Code

O repositório inclui configuração para o [Claude Code](https://claude.com/claude-code):

- `CLAUDE.md` — contexto, convenções e comandos do projeto.
- `.claude/settings.json` — permissões do projeto (comandos liberados e bloqueio de leitura do `.env`).
- `.claude/skills/`:
  - `novo-modulo` — cria um módulo CRUD completo no padrão do projeto
  - `novo-dto` — cria DTOs de entrada/saída
  - `prisma-migration` — altera o schema e gera migration + client
  - `testar-api` — sobe o servidor e faz smoke test das rotas

## Licença

ISC — MarcosDev
