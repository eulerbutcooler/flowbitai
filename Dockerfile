FROM node:22-alpine

WORKDIR /app

COPY package*.json tsconfig.json ./
RUN npm install

COPY . .

RUN npx prisma generate --schema=./api/prisma/schema.prisma

EXPOSE 3000

CMD ["npx", "tsx", "api/index.ts"]
