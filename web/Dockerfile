FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.21.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY api/package.json api/package.json
COPY contracts/package.json contracts/package.json
COPY web/package.json web/package.json
RUN pnpm install --frozen-lockfile

FROM deps AS build
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
COPY contracts/ contracts/
COPY web/ web/
RUN pnpm --filter @cyber/contracts build && pnpm --filter @cyber/web build

FROM node:22-alpine AS runner
RUN corepack enable && corepack prepare pnpm@11.21.0 --activate
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/web/node_modules ./web/node_modules
COPY --from=build /app/web/.next ./web/.next
COPY --from=build /app/web/public ./web/public
COPY --from=build /app/web/package.json ./web/package.json
COPY --from=build /app/web/next.config.ts ./web/next.config.ts
COPY --from=build /app/web/tsconfig.json ./web/tsconfig.json
COPY --from=build /app/contracts ./contracts
COPY --from=build /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml
EXPOSE 3001
CMD ["pnpm", "--dir", "web", "start"]