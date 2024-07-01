# FROM node:lts-alpine

# # Create app directory
# WORKDIR /usr/src/app

# # copy both to the container
# COPY package*.json ./

# # install packages to the container
# RUN npm install

# # copy everything
# COPY . .

# # generate the prisma database client
# RUN npx prisma generate

# # expose the api port
# EXPOSE 4000

# # run the app
# CMD [ "npm", "run", "start" ]