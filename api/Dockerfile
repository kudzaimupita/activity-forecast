# Build stage
FROM node:18-alpine AS builder

WORKDIR /var/app

COPY package.json package-lock.json ./

RUN npm install --production=false

COPY . .

RUN npm run build

# Production stage
FROM node:18-alpine AS production

ENV NODE_ENV=production

WORKDIR /var/app

COPY --from=builder /var/app/package.json ./package.json
COPY --from=builder /var/app/package-lock.json ./package-lock.json
COPY --from=builder /var/app/node_modules ./node_modules
COPY --from=builder /var/app/dist ./dist

RUN npm prune --production

EXPOSE 8000

CMD ["npm", "run", "start"]
