#######################
# Step 1: Base target #
#######################
FROM node:12.13.1-slim as base
ARG http_proxy
ARG https_proxy
ARG npm_registry
ARG no_proxy

# Base dir /app
WORKDIR /app
# Expose the listening port of your app
EXPOSE 8000

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo "Europe/Paris" > /etc/timezone ; \
# use proxy & private npm registry
    if [ ! -z "$http_proxy" ] ; then \
        npm config delete proxy; \
        npm config set proxy $http_proxy; \
        npm config set https-proxy $https_proxy; \
        npm config set no-proxy $no_proxy; \
   fi ; \
   [ -z "$npm_registry" ] || npm config set registry=$npm_registry

################################
# Step 2: "development" target #
################################
FROM base as development
ARG APP_VERSION
COPY src src/
COPY babel.config.js package.json package-lock.json ./
# Install app dependencies
RUN npm --no-git-tag-version version ${APP_VERSION} ; npm install
ENV NODE_ICU_DATA="/app/node_modules/full-icu"

#CMD ["npm", "start"]
CMD ["npm","run",  "dev"]

##########################
# Step 3: "build" target #
##########################
FROM development as build
ENV NPM_CONFIG_LOGLEVEL warn
# Transpile the code with babel
RUN npm run build

###############################
# Step 4: "production" target #
###############################

FROM build as production
ARG NPM_AUDIT_DRY_RUN
ENV NODE_ENV=production
ARG APP_VERSION
COPY package.json package-lock.json ./
# Copy the pm2 config
COPY ecosystem.config.js .
# Copy the transpiled code to use in production (in /app)
COPY --from=build /app/dist ./dist
# Install production dependencies and clean cache
RUN npm --no-git-tag-version version ${APP_VERSION} && \
    npm install --production && \
    npm config set audit-level moderate && \
    npm audit --json --registry=https://registry.npmjs.org --production || ${NPM_AUDIT_DRY_RUN:-false} && \
    npm cache clean --force ; \
    npm install pm2 -g

CMD [ "pm2-runtime", "start", "ecosystem.config.js", "--env", "production" ]
