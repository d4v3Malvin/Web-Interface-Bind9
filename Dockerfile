# Dockerfile for bind dns rpz.
# use official ubuntu Image
FROM ubuntu:latest

# Set metadata
LABEL maintainer="dm.enterprienur@gmail.com"
LABEL description="Docker Container for Bind9 with setup RPZ"

# Install Bind9

RUN apt-get update \
  && apt-get install -y bind9 ca-certificates curl gnupg

RUN mkdir -p /etc/apt/keyrings \
  && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
  && NODE_MAJOR=20 \
  && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list

RUN apt-get update \
  && apt-get install nodejs -y

# Expose necessary ports
EXPOSE 53/udp 53/tcp 3000

WORKDIR /etc/bind

# Copy the setup configuration
COPY bind-conf/named.conf.options named.conf.options

# Make RPZ ads Zone
COPY bind-conf/db.example db.ads.rpz

# Make RPZ blocked Zone
COPY bind-conf/db.example db.blocked.rpz

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