# Image that is only used to build the application
FROM node:lts-alpine as build
WORKDIR /app
# Copy files in the order of least changed to most often changed to reduce
# number of layers to build when changing something
COPY tsconfig.json ./
COPY .yarn ./.yarn
COPY .yarnrc.yml yarn.lock ./
COPY package.json ./
# Install all dependencies (including devDependencies)
RUN yarn install
# The source code is copied after installing the dependencies so we don't
# run the install process every time we change something in the code without
# touching the dependencies
COPY src src
RUN yarn build



# This is the actual application image
FROM node:lts-alpine
RUN adduser -D app
WORKDIR /app
RUN chown app /app
USER app
# Copy files in the order of least changed to most often changed to reduce
# number of layers to build when changing something
COPY --chown=app .yarn ./.yarn
COPY .yarnrc.yml yarn.lock ./
COPY package.json ./
# Only install dependencies used in production (exclude devDependencies)
RUN yarn workspaces focus --production --all
# The built application code is copied after installing the dependencies so we
# don't run the install process every time we change something in the code
# without touching the dependencies
COPY --from=build /app/dist ./dist
CMD ["yarn", "start"]
