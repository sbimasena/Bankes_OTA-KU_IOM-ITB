FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache curl

COPY package.json package-lock.json ./

RUN npm ci --legacy-peer-deps

RUN npm i -g serve

COPY . .

# Declare build-time args (passed via docker-compose build.args)
ARG VITE_APP_URL=http://localhost:5173
ARG VITE_API_URL=http://localhost:3000
ARG VITE_KEYCLOAK_CLIENT_ID=ota-ku-app
ARG VITE_KEYCLOAK_REDIRECT_URI=http://localhost:5173/integrations/keycloak/callback
ARG VITE_VAPID_PUBLIC_KEY=

# Make them available to the Vite build process as environment variables
ENV VITE_APP_URL=$VITE_APP_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_KEYCLOAK_CLIENT_ID=$VITE_KEYCLOAK_CLIENT_ID
ENV VITE_KEYCLOAK_REDIRECT_URI=$VITE_KEYCLOAK_REDIRECT_URI
ENV VITE_VAPID_PUBLIC_KEY=$VITE_VAPID_PUBLIC_KEY

RUN npm run build

EXPOSE 3000

CMD [ "serve", "-s", "dist" ]