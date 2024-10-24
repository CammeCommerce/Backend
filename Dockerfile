FROM node:18-alpine

RUN apk add --no-cache bash

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install -g typescript

COPY wait-for-it.sh /usr/wait-for-it.sh
RUN chmod +x /usr/wait-for-it.sh

COPY . .

EXPOSE 8080

ENV NODE_OPTIONS="--max-old-space-size=6144"
ENV TS_NODE_PROJECT="./tsconfig.json"

RUN tsc --project tsconfig.build.json

CMD ["node", "dist/main.js"]