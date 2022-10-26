FROM node:18

# Install app
#WORKDIR /
# RUN pwd
COPY package*.json ./
COPY tsconfig*.json ./
COPY src ./

RUN yarn
RUN yarn run tsc

# Expose correct ports
EXPOSE 3030

# Start the server
CMD ["node", "build/index.js"]
