FROM node:18.16.1-alpine as builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY src ./src
COPY tsconfig.json ./

RUN npm run build

# Start production image build
FROM node:18.16.1-alpine as runner

ENV NODE_ENV production

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build

CMD ["npm", "run", "start"]