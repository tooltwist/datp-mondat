FROM node:16

# Install dependencies.
RUN apt-get update
RUN apt-get install xsel
RUN npm install -g serve

# Install npm modules first
COPY package.json /src/package.json
WORKDIR /src
RUN yarn install


# Now install the rest of the app
WORKDIR /src
COPY . /src

# Generate the static Mondat site
RUN yarn generate

# Now we'll run an HTTP server, to serve up the static site
EXPOSE  3000
CMD ["yarn", "start"]
