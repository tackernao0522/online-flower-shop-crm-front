FROM node:20-alpine

WORKDIR /app

RUN npm install -g npm@11.0.0

CMD ["sh", "-c", "npm install && npm run dev"]
