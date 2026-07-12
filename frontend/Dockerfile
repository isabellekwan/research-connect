FROM node:20-alpine
WORKDIR /app/frontend
COPY frontend/package.json ./package.json
COPY frontend/tsconfig.json ./tsconfig.json
RUN npm install
COPY frontend ./
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
