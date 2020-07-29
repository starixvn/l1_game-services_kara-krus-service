# Base image
FROM node:14-alpine3.10

# Creating a directory inside the base image and defining as the base directory
WORKDIR /src

# Copying the files of the root directory into the base directory
COPY ./src /src

RUN npm run reg
RUN npm install
RUN npm rebuild

CMD [ "npm", "run", "prod" ]