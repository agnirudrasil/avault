FROM node:17

ENV NODE_OPTIONS=--openssl-legacy-provider

COPY ./package.json .

COPY ./yarn.lock .

RUN yarn install
RUN yarn add --dev "@types/node"

COPY . .

ENV NEXT_PUBLIC_API_URL https://avault.agnirudra.me/api/v1
ENV NEXT_PUBLIC_GATEWAY_URL wss://gateway.avault.agnirudra.me/
ENV NEXT_PUBLIC_CDN_URL https://cdn.avault.agnirudra.me/

RUN yarn build


CMD ["yarn", "start"]
