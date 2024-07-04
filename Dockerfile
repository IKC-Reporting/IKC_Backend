FROM node:lts-alpine

# Create app directory
WORKDIR .

# copy both to the container
COPY package*.json .

# install packages to the container
RUN npm install

# copy everything
COPY . .

# expose the api port
EXPOSE ${GRAPHQL_PORT}
