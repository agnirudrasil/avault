FROM node:17

ENV NODE_OPTIONS=--openssl-legacy-provider

COPY ./package.json .

COPY ./yarn.lock .

RUN yarn install

COPY . .

RUN yarn build

CMD ["yarn", "start"]