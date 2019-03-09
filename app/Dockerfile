FROM node:10

WORKDIR /usr/app

# Copy both package.json and package-lock.json
COPY package*.json ./

RUN npm ci

CMD ["npm", "start"]

