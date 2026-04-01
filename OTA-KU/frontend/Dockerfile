FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache curl

COPY package.json .

RUN npm install --force

RUN npm i -g serve

COPY . .

RUN npm run build

EXPOSE 3000

CMD [ "serve", "-s", "dist" ]