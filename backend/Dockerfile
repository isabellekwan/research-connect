FROM node:20-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json
RUN npm ci --workspace backend
COPY backend/tsconfig.json ./backend/tsconfig.json
COPY backend/src ./backend/src
RUN npm --workspace backend run build

FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json
RUN npm ci --omit=dev --workspace backend
COPY --from=build /app/backend/dist ./backend/dist
COPY backend/src/db/migrations ./backend/dist/db/migrations

EXPOSE 4000
CMD ["sh", "-c", "node backend/dist/db/migrate.js && node backend/dist/app.js"]
