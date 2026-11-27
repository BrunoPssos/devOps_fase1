# Imagem de produção da Task API
FROM node:26-alpine

ENV NODE_ENV=production \
    PORT=3000

WORKDIR /app

# Dependências primeiro, para aproveitar o cache de camadas do Docker
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY src ./src

# Versão exibida nos logs (preenchida pelo pipeline com o SHA do commit)
ARG APP_VERSION=dev
ENV APP_VERSION=$APP_VERSION

# Segurança: o processo roda com o usuário "node", sem privilégios de root
USER node

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT}/health || exit 1

CMD ["node", "src/server.js"]
