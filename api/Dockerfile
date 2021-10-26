#Dockerfile of the API
#source https://nodejs.org/de/docs/guides/nodejs-docker-webapp/

FROM node:10

# Create app directory
WORKDIR /usr/src/app/api


COPY package.json /usr/src/app/api/

RUN npm install

# Bundle app source
COPY . .

EXPOSE 8000
CMD [ "npm", "start" ]