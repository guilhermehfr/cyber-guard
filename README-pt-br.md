<div align="center">

# 🛡️ CyberGuard

Uma plataforma gamificada de aprendizado em segurança digital, onde jogadores completam missões, respondem perguntas, ganham pontos e competem em um ranking em tempo real.

[![License: MIT](https://img.shields.io/github/license/guilhermehfr/cyber-guard)](https://github.com/guilhermehfr/cyber-guard/blob/dev/LICENSE)
[![Vercel](https://img.shields.io/badge/Vercel-Demo-000000?logo=vercel&logoColor=white)](https://cyberguard-aexp.vercel.app)
[![Render](https://img.shields.io/badge/Render-API-46E3B7?logo=render&logoColor=white)](https://cyber-guard-8j1x.onrender.com)


**Backend:** NestJS · Fastify · Prisma · PostgreSQL · Redis  
**Frontend:** Next.js · React · TypeScript  
**Infraestrutura/Tooling:** Docker Compose · pnpm · Vitest · Biome

🌐 _[Read in English](README.md)_

<img src="https://github.com/user-attachments/assets/d9e1aef3-1709-4975-8cca-7d64ad18962f" alt="CyberGuard" width="820" />

[GitHub](https://github.com/guilhermehfr/cyber-guard) · [Demo](https://cyberguard-aexp.vercel.app) · [Reportar um Bug](https://github.com/guilhermehfr/cyber-guard/issues)

</div>

---

## ✨ Features

- **Cadastro e login** com e-mail e senha, com hashing de senha via Argon2.
- **Autenticação via JWT armazenado em cookie HttpOnly**, o que impede que o token seja acessado diretamente por JavaScript no navegador.
- **Login social com Google (OAuth 2.0)**, com fluxo de estado (`state`) próprio para proteção contra CSRF no callback.
- **Rotas protegidas** no backend via `JwtAuthGuard`/estratégia Passport-JWT, e gate de acesso no frontend com base no estado de sessão.
- **Missões gamificadas** com três níveis de dificuldade (Fácil, Médio, Difícil), cada uma com pontuação própria.
- **Perguntas e respostas por missão**, com fluxo de início de missão, envio de respostas e finalização.
- **Ranking de jogadores** com critérios de desempate determinísticos.
- **Atualização do ranking em tempo real via WebSocket**, refletindo automaticamente novas pontuações sem a necessidade de recarregar a página.

### Mecânica das missões

Cada missão pertence a um nível de dificuldade (`EASY`, `MEDIUM` ou `HARD`), que define a pontuação total da missão. O jogador inicia uma missão, responde às suas perguntas uma a uma e, ao concluir, o backend calcula a pontuação com base no número de respostas corretas multiplicado pelos pontos da missão — o resultado nunca é calculado ou confiado a partir do cliente.

---

## 🛡️ Security & Integrity

CyberGuard foi desenhado para que o frontend nunca seja tratado como fonte confiável de pontuação ou de estado crítico de jogo. Algumas decisões técnicas relevantes:

- **O frontend não é fonte de verdade.** O cliente envia apenas as respostas escolhidas pelo jogador; toda validação de corretude e todo cálculo de pontuação acontecem no backend, a partir dos dados de gabarito carregados do banco no início da missão.
- **JWT em cookie HttpOnly.** O token de autenticação nunca é exposto ao JavaScript do navegador — ele trafega automaticamente entre navegador e API através de um cookie HttpOnly, reduzindo a superfície de exposição a ataques de XSS.
- **Prevenção de conclusão duplicada de missão.** Além da validação em nível de serviço, existe uma constraint de unicidade no banco de dados (`@@unique([playerId, missionId])`, na tabela `Attempt`), garantindo que um jogador não possa ser pontuado duas vezes pela mesma missão mesmo sob requisições concorrentes.
- **Conclusão de missão transacional.** A leitura da missão, a criação da tentativa (`Attempt`) e o incremento de pontos do jogador ocorrem dentro de uma transação do Prisma. Caso uma requisição concorrente viole a constraint de unicidade, o conflito é tratado como um erro de domínio apropriado (`ConflictException`), em vez de corromper o estado do jogador.

---

## 🛠 Tech Stack

### Backend

| Tecnologia | Uso |
|---|---|
| NestJS | Framework principal da API |
| Fastify | Adapter HTTP utilizado pelo NestJS |
| Prisma | ORM e acesso ao banco de dados |
| PostgreSQL | Banco de dados relacional, fonte de verdade |
| Redis | Estado temporário das sessões de jogo em andamento |
| Passport + JWT | Autenticação baseada em token |
| Google OAuth 2.0 | Autenticação social |
| WebSocket (`@nestjs/websockets`) | Comunicação em tempo real com o frontend |
| class-validator / ValidationPipe | Validação de dados de entrada |
| Vitest | Testes unitários e de integração |

### Frontend

| Tecnologia | Uso |
|---|---|
| Next.js | Framework React com App Router |
| React | Biblioteca de interface |
| TypeScript | Tipagem estática |
| Tailwind CSS | Estilização utilitária |
| WebSocket nativo | Recebimento de eventos em tempo real da API |
| Biome | Lint e formatação |

### Tooling & Infraestrutura

| Ferramenta | Uso |
|---|---|
| TypeScript | Base de todo o monorepo |
| pnpm | Gerenciador de pacotes e workspaces |
| Docker Compose | Orquestração local de API, frontend, banco e Redis |
| Biome | Padronização de código em todo o monorepo |
| Vitest | Testes automatizados da API |
| Prisma | Migrações e schema do banco de dados |
| GitHub Actions | Pipeline de qualidade em pull requests |

---

## 🎮 Gameplay

O fluxo de jogo segue a seguinte jornada:

```
Landing page → cadastro/login → área de jogo → seleção de dificuldade
→ seleção de missão → início da missão → perguntas → envio de respostas
→ conclusão da missão → atualização de pontuação → ranking
```

As missões são organizadas em três níveis de dificuldade:

- **Fácil** — perguntas com 2 alternativas de resposta.
- **Médio** — perguntas com 3 alternativas de resposta.
- **Difícil** — perguntas com 4 alternativas de resposta.

Cada missão conta com um conjunto de perguntas, e a pontuação total da missão varia conforme o nível de dificuldade escolhido.

Durante o jogo, um cronômetro é exibido como elemento de gamificação e feedback visual para o jogador. A validação das respostas e o cálculo da pontuação permanecem inteiramente sob responsabilidade do backend, independentemente do tempo decorrido na interface.

---

## 📡 Real-time

CyberGuard utiliza WebSocket para manter o ranking atualizado em tempo real. Sempre que um jogador conclui uma missão, o backend emite eventos (`ranking.updated` e `player.score.updated`) através de um gateway WebSocket público e somente leitura. O frontend escuta esses eventos para atualizar automaticamente o ranking exibido, sem necessidade de recarregar a página.

O WebSocket é utilizado exclusivamente para notificação de mudanças de estado — ele não substitui a API HTTP nem participa do fluxo de autenticação; toda comunicação sensível continua acontecendo via REST.

---

## 📁 Project Structure

```
cyber-guard/
├── api/                        # Backend NestJS
│   ├── src/
│   │   ├── config/              # Configuração e validação de variáveis de ambiente
│   │   ├── infrastructure/
│   │   │   ├── database/        # Integração com Prisma
│   │   │   └── redis/           # Acesso a Redis (sessões de jogo)
│   │   └── modules/
│   │       ├── auth/            # Cadastro, login, JWT, Google OAuth
│   │       ├── missions/        # Missões, perguntas, sessões de jogo, conclusão
│   │       ├── players/         # Consultas internas de jogadores
│   │       ├── ranking/         # Ranking e posição dos jogadores
│   │       └── realtime/        # Gateway WebSocket
│   └── prisma/                  # Schema, migrações e seed do banco
│
├── web/                        # Frontend Next.js
│   └── src/
│       ├── app/                 # Rotas (App Router)
│       ├── components/          # Componentes compartilhados de UI
│       ├── features/
│       │   ├── auth/             # Login, cadastro, sessão
│       │   ├── missions/         # Seleção e jogabilidade das missões
│       │   └── ranking/          # Ranking e pódio
│       └── lib/                 # Cliente HTTP e cliente WebSocket
│
├── contracts/                  # Tipos TypeScript compartilhados entre API e frontend
│   └── src/
│
├── docs/                       # Documentação complementar
├── docker-compose.yml           # Orquestração local (API, web, PostgreSQL, Redis)
└── pnpm-workspace.yaml           # Definição do monorepo
```

---

## 🧱 Architecture

CyberGuard é um monorepo gerenciado com pnpm, dividido em três pacotes principais: `api` (backend), `web` (frontend) e `contracts` (tipos compartilhados).

O backend é um monólito modular construído em NestJS — não uma arquitetura de microsserviços —, com separação clara de responsabilidades entre os módulos `Auth`, `Missions`, `Players`, `Ranking` e `Realtime`, cada um encapsulando sua própria lógica de negócio dentro do mesmo processo e deploy. PostgreSQL, via Prisma, é a fonte de verdade dos dados.

Durante uma missão, o estado da sessão de jogo — perguntas, gabarito e respostas já enviadas pelo jogador — é mantido temporariamente no Redis, isolado do PostgreSQL, entre o início e a conclusão da missão. Ao concluir, o resultado é persistido no PostgreSQL de forma transacional e a sessão correspondente é removida do Redis; esse é o mesmo momento em que o evento de atualização em tempo real é emitido para o ranking.

O pacote `contracts` concentra os tipos TypeScript compartilhados entre frontend e backend — como formatos de requisição/resposta de autenticação, missões, ranking e eventos em tempo real — evitando duplicação de tipos entre as duas aplicações.

---

## 🧪 Testing

O backend possui testes unitários para services e controllers, cobrindo autenticação, missões, ranking, infraestrutura de Redis e o gateway de tempo real. Alguns exemplos:

- `missions.service.spec.ts` — inclui a lógica de conclusão de missão, prevenção de duplicidade e transação.
- `auth.controller.spec.ts` / `auth.service.spec.ts` — fluxo de cadastro, login e cookies de sessão.
- `password.service.spec.ts` — hashing e verificação de senha.
- `ranking.service.spec.ts` — ordenação e critérios de desempate do ranking.
- `realtime.gateway.spec.ts` — emissão de eventos em tempo real.
- `redis.service.spec.ts` — acesso à infraestrutura de Redis.

Os testes são executados com Vitest.

---

## 🚀 Getting Started

### Pré-requisitos

- Node.js
- pnpm
- Docker

### Instalação

```bash
git clone https://github.com/guilhermehfr/cyber-guard.git
cd cyber-guard
pnpm install
```

### Subindo com Docker Compose

```bash
pnpm docker:up     # docker compose up -d --build
pnpm docker:down   # docker compose down
pnpm docker:reset  # docker compose down -v --rmi all --remove-orphans
```

Isso sobe os quatro serviços definidos no `docker-compose.yml`: `api` (porta 3000), `web` (porta 3001), `db` (PostgreSQL, porta 5432) e `redis` (porta 6379).

### Variáveis de ambiente

A API valida suas variáveis de ambiente na inicialização (`api/src/config/env.validation.ts`). Use `api/.env.local.example` como referência. O frontend usa `web/.env.local.example` como referência.

> As credenciais do Google OAuth são obrigatórias para a API iniciar, mesmo que você pretenda testar apenas o login por e-mail e senha.

### Rodando localmente sem Docker

Com o PostgreSQL e o Redis disponíveis (localmente ou via Docker) e as variáveis de ambiente configuradas:

```bash
pnpm --filter api prisma:migrate   # aplica as migrações
pnpm --filter api db:seed          # popula dados de desenvolvimento
```

Rodando tudo em paralelo:

```bash
pnpm dev
```

Ou rodando cada aplicação individualmente:

```bash
pnpm --filter api dev   # http://localhost:3000
pnpm --filter web dev   # http://localhost:3002
```

### Build

```bash
pnpm build
```

---

## 👋 Contato

- GitHub: [guilhermehfr](https://github.com/guilhermehfr)
- LinkedIn: [guilhermehe](https://www.linkedin.com/in/guilhermehe/)
