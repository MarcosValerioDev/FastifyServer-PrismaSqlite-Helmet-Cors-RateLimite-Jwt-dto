---
name: testar-api
description: Sobe o servidor Fastify localmente e faz smoke test das rotas (health, auth, users, validação, JWT, rate limit) com curl. Use para verificar se uma alteração funciona de verdade, não só no typecheck.
---

# Testar a API

1. Garanta `.env` (copie de `.env.example` se não existir), banco migrado (`npx prisma migrate deploy`) e client gerado (`npx prisma generate`).

2. Suba numa porta livre em background e aguarde o `/health`:
   ```bash
   (PORT=3399 npx tsx src/server.ts > "$TEMP/srv.log" 2>&1 &)
   for i in $(seq 1 30); do curl -s localhost:3399/health >/dev/null && break; sleep 0.5; done
   ```

3. Fluxo básico (ajuste aos endpoints alterados):
   ```bash
   B=http://localhost:3399; J='-H Content-Type:application/json'
   R=$(curl -s $J -d '{"name":"Teste","email":"teste@exemplo.com","password":"senha12345"}' $B/auth/register)
   T=$(echo $R | node -pe "JSON.parse(require('fs').readFileSync(0)).accessToken")
   curl -s -H "Authorization: Bearer $T" $B/users/me
   ```

4. Casos que sempre valem conferir:
   - Body inválido / campo extra → **400** com `details` por campo
   - Sem token / token inválido → **401**
   - Alterar recurso de outro usuário → **403**
   - Id inexistente → **404**; e-mail duplicado → **409**
   - `/auth/login` acima de 5 req/min → **429**
   - Resposta nunca contém `passwordHash`
   - Headers do helmet (`Content-Security-Policy`, `X-Frame-Options`) presentes
   - Swagger: `curl -s -L -o /dev/null -w "%{http_code}" $B/docs` → 200 e `$B/docs/json` lista as rotas novas em `paths` e os DTOs em `components.schemas`

5. Encerre o servidor (Windows):
   ```bash
   netstat -ano | grep ":3399" | grep LISTEN | awk '{print $5}' | head -1 | xargs -I{} taskkill //PID {} //F
   ```
   Em Linux/macOS: `kill $(lsof -t -i:3399)`.

6. Os registros de teste ficam no `prisma/dev.db`. Não apague o banco sem pedir ao usuário.

Relate os status HTTP obtidos de cada caso — inclusive os que falharem.
