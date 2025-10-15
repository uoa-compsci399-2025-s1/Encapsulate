# To use this Dockerfile, you have to set `output: 'standalone'` in your next.config.mjs file.
# From https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile

FROM node:22.16.0-slim AS base

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Step 1: Install modules
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile --prod

# Step 2: Copy the rest of the standalone build
COPY . .

# Step 3: Run the application
EXPOSE 3000
CMD ["node", "server.js"]
