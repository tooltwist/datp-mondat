#FROM node:16
FROM registry.ubx.ph/docker-images/ubuntu:20.04

ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=$USER_UID

# Ensure apt is in non-interactive to avoid prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies.
RUN apt-get -y update
RUN apt-get -y install xsel

# Install dependencies.
RUN apt-get -y update --no-install-recommends \
    && apt-get -y install --no-install-recommends \
    build-essential \
    curl \
    ca-certificates \
    apt-utils \
    dialog \
    git \
    vim \
    ssh \
    && apt-get autoremove -y \
    && apt-get clean -y

# Add Node.js repository.
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash -

# Install Node.js.
RUN apt-get -y update --no-install-recommends \
    && apt-get -y install --no-install-recommends nodejs \
    && apt-get autoremove -y \
    && apt-get clean -y

RUN npm config set unsafe-perm true
RUN npm install -g yarn
RUN yarn global add sass-migrator nodemon pm2

RUN apt-get -y install curl iputils-ping
RUN apt-get -y install sudo

RUN npm install -g serve

# Install npm modules first
COPY package.json /src/package.json
WORKDIR /src
RUN yarn install


# Now install the rest of the app
WORKDIR /src
COPY . /src

# Install a websiteConfig.json file that contains JuiceConfig variables,
# so start_inside_docker_container.sh can update the variables from
# AWS Secrets Manager. Note that this needs to happen at container
# startup time, so changes to the config can be propagated to MONDAT
# without rebuilding the Docker image.
RUN mv protected-config/websiteConfig.js-JUICE protected-config/websiteConfig.js

# Generate the static Mondat site
RUN yarn generate

# Now we'll run an HTTP server, to serve up the static site
RUN chmod +x /src/start_inside_docker_container.sh
EXPOSE  3000
CMD ["bash", "/src/start_inside_docker_container.sh"]
