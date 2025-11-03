FROM docker.io/node:22-alpine AS build
WORKDIR /source

COPY package-lock.json .
COPY package.json .

RUN npm i --no-audit

COPY . .

RUN npm run build-prod

FROM docker.io/nginx:1.29.2-alpine

RUN apk add bash

RUN mkdir /etc/nginx/templates
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /source/dist /usr/share/nginx/html