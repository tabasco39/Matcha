FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY server/ ./server/

RUN mkdir -p server/uploads

EXPOSE 3000

CMD ["node", "server/server.js"]
