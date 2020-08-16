ARG NODE=14.8.0-alpine

FROM node:$NODE
WORKDIR /app
COPY package.json package-lock.json ./
RUN HUSKY_SKIP_INSTALL=true npm ci --no-audit && npm cache clean --force
COPY . .
RUN PARCEL_WORKERS=1 npm run build

FROM node:$NODE
WORKDIR /app
ENV NODE_ENV=production
EXPOSE 3000
COPY --from=0 /app/dist .
CMD ["node", "server"]
