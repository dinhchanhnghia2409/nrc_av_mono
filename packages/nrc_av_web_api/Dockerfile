FROM node:hydrogen-alpine3.17 AS development

WORKDIR /app

COPY . .

RUN yarn ci
RUN yarn build

# Clean devDependencies
RUN yarn ci --prod

###################
# PRODUCTION
###################

FROM node:hydrogen-alpine3.17 AS production

WORKDIR /app

# Copy the bundled code from the build stage to the production image
COPY --from=development /app/node_modules ./node_modules
COPY --from=development /app/dist ./dist

# Start the server using the production build
CMD [ "node", "dist/main.js" ]
