FROM node:18-alpine

WORKDIR /app

COPY . /app

RUN npm install -g ts-node

RUN npm install

RUN docker-compose build

EXPOSE 3000

VOLUME [ "/app/node_modules" ]

CMD ["npm","start"]