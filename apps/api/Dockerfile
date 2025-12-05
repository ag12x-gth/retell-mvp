###
# FASE 6: DEPLOY E INFRAESTRUTURA
# Auto-Model Router: GPT-5.1 Codex (DevOps/Docker)
# 
# Dockerfile otimizado para API NestJS em produção
###

# Stage 1: Build
FROM node:18-alpine AS builder

# Instalar dependências do sistema
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/ ./packages/

# Instalar dependências (incluindo dev para build)
RUN npm ci

# Copiar código fonte
COPY apps/api/ ./apps/api/
COPY packages/ ./packages/
COPY tsconfig.json ./
COPY turbo.json ./

# Gerar Prisma Client
WORKDIR /app/apps/api
RUN npx prisma generate

# Build da aplicação
RUN npm run build

# Remover devDependencies
RUN npm prune --production

# Stage 2: Production
FROM node:18-alpine AS production

# Instalar apenas runtime dependencies
RUN apk add --no-cache dumb-init

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

# Copiar apenas o necessário do stage de build
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder --chown=nestjs:nodejs /app/packages ./packages

# Copiar package.json para scripts
COPY --chown=nestjs:nodejs apps/api/package.json ./apps/api/

WORKDIR /app/apps/api

# Mudar para usuário não-root
USER nestjs

# Expor porta da aplicação
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Usar dumb-init para lidar com sinais corretamente
ENTRYPOINT ["dumb-init", "--"]

# Comando de inicialização
CMD ["node", "dist/main.js"]
