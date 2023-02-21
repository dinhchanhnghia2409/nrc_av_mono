FROM node:18-alpine AS development

WORKDIR /app
COPY ./package*.json ./
RUN npm i
COPY . .
RUN npm run build

FROM node:18-alpine AS production
WORKDIR /app
COPY --from=development /app ./
CMD ["npm", "run", "start:prod"]