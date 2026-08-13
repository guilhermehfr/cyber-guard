FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.21.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY api/package.json api/package.json
COPY contracts/package.json contracts/package.json
RUN pnpm install --frozen-lockfile

FROM deps AS build
ENV DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder
COPY contracts/ contracts/
COPY api/ api/
RUN pnpm --filter @cyber/contracts build && pnpm --filter @cyber/api build

FROM node:22-alpine AS runner
RUN corepack enable && corepack prepare pnpm@11.21.0 --activate
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/api/node_modules ./api/node_modules
COPY --from=build /app/api/dist ./api/dist
COPY --from=build /app/api/package.json ./api/package.json
COPY --from=build /app/contracts/dist ./contracts/dist
COPY --from=build /app/contracts/package.json ./contracts/package.json
COPY --from=build /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml
EXPOSE 3000
CMD ["node", "api/dist/main.js"]