# Multi-stage build for React client served via Nginx
FROM node:20 AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json vite.config.ts ./
COPY src ./src
COPY public ./public
COPY index.html ./

RUN npm run build

# Nginx runner
FROM nginx:alpine

COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
