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

# Install a websiteConfig.json file that contains JuiceConfig variables,
# so start_inside_docker_container.sh can update the variables from
# AWS Secrets Manager. Note that this needs to happen at container
# startup time, so changes to the config can be propagated to MONDAT
# without rebuilding the Docker image.
RUN mv protected-config/websiteConfig.js-withJuiceVariables protected-config/websiteConfig.js
RUN chmod +x /src/start_inside_docker_container.sh

# Now we'll run an HTTP server, to serve up the static site
EXPOSE  3000
CMD ["bash", "/src/start_inside_docker_container.sh"]
