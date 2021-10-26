#Dockerfile of frontend

FROM node:10

WORKDIR /usr/src/app/frontend
COPY . .

RUN npm install

EXPOSE 8080
CMD ["npm", "run", "serve"]