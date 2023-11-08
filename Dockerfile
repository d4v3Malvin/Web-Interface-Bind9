# Dockerfile for bind dns rpz.
# use official ubuntu Image
FROM node:18-slim

# Set metadata
LABEL maintainer="dm.enterprienur@gmail.com"
LABEL description="Docker Container for Bind9 with setup RPZ and the backend for bind9"

# Install Bind9

RUN apt-get update \
  && apt-get install -y bind9 

# Expose necessary ports
EXPOSE 53/udp 53/tcp 3000

WORKDIR /etc/bind

# Copy the setup configuration
COPY bind-conf/named.conf.options named.conf.options

# Make directory for Bind Log
RUN mkdir -p /var/log/bind

# Change the ownership of file to bind
RUN chown -R bind:bind /var/log/bind

# Make Directory for script
RUN mkdir -p /home/webScript

# Copy the script to the container
COPY script /home/webScript/

RUN chmod +x /home/webScript/*

# Make Directory for API Backend
RUN mkdir -p /home/back_api

WORKDIR /home/back_api/

# Copy the app to the API Backend
COPY node-api/ .

# install node dependency
RUN npm install 

WORKDIR /home/webScript

CMD ["./start_docker.sh"]