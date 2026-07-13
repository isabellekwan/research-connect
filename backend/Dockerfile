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

EXPOSE 4000
CMD ["node", "backend/dist/app.js"]
