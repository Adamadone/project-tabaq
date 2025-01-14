FROM node:20.18-alpine3.19

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY ./ ./

RUN npm run build

CMD [ "build/index.js" ]