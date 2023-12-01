FROM node:20

ADD . /app

WORKDIR /app

RUN yarn install

CMD ["yarn", "start"]
