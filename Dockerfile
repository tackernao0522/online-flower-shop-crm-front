FROM node:18-alpine

WORKDIR /app

# npmを最新バージョンにアップデート
RUN npm install -g npm@10.9.2

CMD ["sh", "-c", "npm install && npm run dev"]
