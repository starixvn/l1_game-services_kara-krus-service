# Base image
FROM node:14-alpine3.10

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

WORKDIR /app

COPY ./src ./src
COPY package.json package-lock.json* ./

RUN npm run reg
RUN npm install && npm cache clean --force
RUN npm rebuild

CMD [ "npm", "run", "prod" ]