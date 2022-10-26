FROM node:18

# RUN pwd
COPY package*.json ./
COPY tsconfig*.json ./
COPY yarn.lock ./
COPY src ./

RUN ls

RUN yarn
RUN yarn run tsc

# Expose correct ports
EXPOSE 80

# Start the server
CMD ["node", "dist/index.js"]
